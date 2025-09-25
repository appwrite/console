<script lang="ts">
    import {
        ActionMenu,
        Button,
        Icon,
        Layout,
        Spinner,
        Spreadsheet,
        Typography,
        FloatingActionBar,
        Popover
    } from '@appwrite.io/pink-svelte';
    import { IconCalendar, IconFingerPrint, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import type { Column } from '$lib/helpers/types';
    import { expandTabs } from '../table-[table]/store';
    import SpreadsheetContainer from '../table-[table]/layout/spreadsheet.svelte';
    import { onDestroy, onMount, tick } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import {
        type ColumnInput,
        mapSuggestedColumns,
        type SuggestedColumnSchema,
        tableColumnSuggestions,
        basicColumnOptions,
        mockSuggestions
    } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { sleep } from '$lib/helpers/promises';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Columns } from '../table-[table]/store';
    import { columnOptions } from '../table-[table]/columns/store';
    import Options from './options.svelte';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import { Confirm } from '$lib/components';

    let resizeObserver: ResizeObserver;
    let spreadsheetContainer: HTMLElement;

    let hScroller: HTMLElement | null = null;
    let headerElement: HTMLElement | null = null;
    let rangeOverlayEl: HTMLDivElement | null = null;
    let fadeBottomOverlayEl: HTMLDivElement | null = null;

    let customColumns = $state([]);
    let showFloatingBar = $state(true);
    let hasTransitioned = $state(false);
    let scrollAnimationFrame: number | null = null;

    let confirmDismiss = $state(false);
    let creatingColumns = $state(false);
    const baseColProps = { draggable: false, resizable: false };

    const findHorizontalScroller = (root: HTMLElement | null): HTMLElement | null => {
        let element = root as HTMLElement | null;
        while (element && element !== document.body) {
            const computedStyles = getComputedStyle(element);
            if (
                (computedStyles.overflowX === 'auto' || computedStyles.overflowX === 'scroll') &&
                element.scrollWidth > element.clientWidth
            ) {
                return element;
            }

            element = element.parentElement as HTMLElement | null;
        }
        return null;
    };

    const updateOverlayHeight = () => {
        if (!spreadsheetContainer) return;
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
        }

        if (!headerElement) return;

        const headerRect = headerElement.getBoundingClientRect();
        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dynamicHeightPx = viewportHeight - headerRect.bottom;
        const overlayTop = Math.round(headerRect.bottom - containerRect.top);
        const overlayHeight = $expandTabs
            ? `${dynamicHeightPx}px`
            : `calc(${dynamicHeightPx}px - 89px)`;

        spreadsheetContainer.style.setProperty('--overlay-top', `${overlayTop}px`);
        spreadsheetContainer.style.setProperty('--overlay-height', overlayHeight);
    };

    const updateOverlayBounds = () => {
        if (!spreadsheetContainer) return;
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
        }
        if (!headerElement) return;

        // hook the actual horizontal scroller once
        if (!hScroller || !hScroller.isConnected) {
            const previousScrollLeft = hScroller?.scrollLeft || 0;
            hScroller = findHorizontalScroller(headerElement);
            if (hScroller) {
                hScroller.addEventListener('scroll', recalcAllThrottled, { passive: true });
                // Preserve scroll position when reconnecting to scroller
                if (previousScrollLeft > 0) {
                    hScroller.scrollLeft = previousScrollLeft;
                }
            }
        }

        if (rangeOverlayEl) {
            rangeOverlayEl.style.display = 'block';
        }

        if (customColumns.length === 0) {
            spreadsheetContainer.style.setProperty('--group-left', '40px');
            spreadsheetContainer.style.setProperty('--group-width', '100%');
            return;
        }

        // Custom columns mode: calculate precise overlay bounds
        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const getById = (id: string) =>
            headerElement!.querySelector<HTMLElement>(
                `[role="cell"][data-header="true"][data-column-id="${id}"]`
            );

        // Calculate visible viewport bounds
        const scrollerRect = hScroller ? hScroller.getBoundingClientRect() : containerRect;
        const visibleRight = scrollerRect.right;

        // Get start boundary from $id column
        // as its more reliable than first custom column
        const idCell = getById('$id');
        const startCell = getById(customColumns[0]?.key);
        let endCell = getById(customColumns[customColumns.length - 1]?.key);

        // we use a visible end column
        if (endCell) {
            const endRect = endCell.getBoundingClientRect();
            if (endRect.left >= visibleRight) {
                // Find the last column that's at least partially visible
                for (let i = customColumns.length - 2; i >= 0; i--) {
                    const candidateCell = getById(customColumns[i]?.key);
                    if (
                        candidateCell &&
                        candidateCell.getBoundingClientRect().left < visibleRight
                    ) {
                        endCell = candidateCell;
                        break;
                    }
                }
            }
        }

        if (!idCell || !startCell || !endCell) {
            if (rangeOverlayEl) {
                rangeOverlayEl.style.display = 'none';
            }
            return;
        }

        // overlay positioning - start after selection column to avoid covering it
        const idRect = idCell.getBoundingClientRect();
        const selectionRect = spreadsheetContainer
            .querySelector('[data-select="true"]')
            ?.getBoundingClientRect();

        // Start overlay after selection column if it exists, otherwise after $id
        let startLeft = idRect.right;
        if (selectionRect && selectionRect.right > idRect.right) {
            startLeft = selectionRect.right;
        }

        const left = Math.round(startLeft - containerRect.left);

        // maximum possible width of all custom columns
        const totalFullWidth = customColumns.length * 180;

        // get the actions column and use its left border as the boundary
        const actionsCell = headerElement!.querySelector<HTMLElement>(
            '[role="cell"][data-column-id="actions"]'
        );
        const rawVisibleWidth = Math.round(visibleRight - idRect.right);
        let maxAllowedWidth = rawVisibleWidth;

        if (actionsCell) {
            const actionsRect = actionsCell.getBoundingClientRect();
            const actionsLeft = actionsRect.left - containerRect.left;
            maxAllowedWidth = Math.min(rawVisibleWidth, actionsLeft - left);
        }

        // Set overlay width to not exceed actions column boundary
        const width = Math.min(totalFullWidth, maxAllowedWidth);

        // Apply overlay positioning
        spreadsheetContainer.style.setProperty('--group-left', `${left - 2}px`);
        spreadsheetContainer.style.setProperty('--group-width', `${width + 2}px`);
    };

    // only for mobile, we can remove if not needed!
    const scrollToFirstCustomColumn = () => {
        if (!$isSmallViewport || customColumns.length === 0) return;

        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
        }

        if (!headerElement) return;

        const firstCustomColumnCell = headerElement.querySelector<HTMLElement>(
            `[role="cell"][data-header="true"][data-column-id="${customColumns[0]?.key}"]`
        );

        if (firstCustomColumnCell && hScroller) {
            const cellRect = firstCustomColumnCell.getBoundingClientRect();
            const scrollerRect = hScroller.getBoundingClientRect();
            const scrollLeft = hScroller.scrollLeft + cellRect.left - scrollerRect.left - 40;

            hScroller.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: 'smooth'
            });
        }
    };

    const recalcAll = () => {
        updateOverlayHeight();
        updateOverlayBounds();
    };

    /**
     * Throttled version of recalcAll for scroll events to improve performance
     */
    const recalcAllThrottled = () => {
        if (scrollAnimationFrame !== null) return;

        scrollAnimationFrame = requestAnimationFrame(() => {
            recalcAll();
            scrollAnimationFrame = null;
        });
    };

    const customSuggestedColumns = $derived.by(() => {
        return customColumns.map((col: SuggestedColumnSchema) => {
            const columnOption = getColumnOption(col.type, col.format);

            return {
                id: col.key,
                title: col.key,
                type: col.type as Column['type'],
                format: col.format,
                required: col.required,
                default: col.default,
                size: col.size,
                min: col.min,
                max: col.max,
                width: { min: Math.max(180, col.key.length * 8 + 60) },
                icon: columnOption?.icon,
                draggable: false,
                resizable: false
            };
        });
    });

    const getRowColumns = (): Column[] => [
        {
            id: '$id',
            title: '$id',
            type: 'string',
            width: 180,
            icon: IconFingerPrint,
            ...baseColProps
        },
        ...customSuggestedColumns,
        ...(customColumns.length === 0
            ? [
                  {
                      id: '$createdAt',
                      title: '$createdAt',
                      type: 'datetime' as Column['type'],
                      width: 180,
                      icon: IconCalendar,
                      ...baseColProps
                  },
                  {
                      id: '$updatedAt',
                      title: '$updatedAt',
                      type: 'datetime' as Column['type'],
                      width: 180,
                      icon: IconCalendar,
                      ...baseColProps
                  }
              ]
            : []),
        {
            id: 'actions',
            title: '',
            type: 'string' as Column['type'],
            width: 40,
            isAction: true,
            ...baseColProps
        }
    ];

    const spreadsheetColumns = $derived(getRowColumns());
    const emptyCells = $derived(($isSmallViewport ? 14 : 17) + (!$expandTabs ? 2 : 0));

    onMount(async () => {
        if (spreadsheetContainer) {
            resizeObserver = new ResizeObserver(recalcAll);
            resizeObserver.observe(spreadsheetContainer);
        }

        requestAnimationFrame(recalcAll);
        await suggestColumns();
    });

    function resetSuggestionsStore(fullReset: boolean = true) {
        if (fullReset) {
            // these are referenced in
            // `table-[table]/+page.svelte`
            $tableColumnSuggestions.table = null;
            $tableColumnSuggestions.enabled = false;
        }

        $tableColumnSuggestions.context = null;
        $tableColumnSuggestions.thinking = false;
    }

    /**
     * Mark this as `true` when developing locally,
     * make sure not to spend credits unnecessarily!
     */
    const useMockSuggestions = false;
    async function suggestColumns() {
        $tableColumnSuggestions.thinking = true;
        let suggestedColumns: {
            total: number;
            columns: ColumnInput[];
        } = {
            total: 0,
            columns: []
        };

        try {
            if (useMockSuggestions) {
                /* animation */
                await sleep(1250);
                suggestedColumns = mockSuggestions;
            } else {
                suggestedColumns = (await sdk
                    .forProject(page.params.region, page.params.project)
                    .console.suggestColumns({
                        databaseId: page.params.database,
                        tableId: page.params.table,
                        context: $tableColumnSuggestions.context ?? undefined
                    })) as unknown as {
                    total: number;
                    columns: ColumnInput[];
                };
            }

            const tableName = $tableColumnSuggestions.table?.name ?? undefined;
            trackEvent(Submit.ColumnSuggestions, {
                tableName,
                total: suggestedColumns.total
            });

            customColumns = mapSuggestedColumns(suggestedColumns.columns);

            if (customColumns.length > 0) {
                setTimeout(scrollToFirstCustomColumn, 100);
                setTimeout(() => (hasTransitioned = true), 300);
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });

            trackError(error, Submit.ColumnSuggestions);
        } finally {
            resetSuggestionsStore(false);
        }
    }

    function onPopoverShowStateChanged(value: boolean) {
        showFloatingBar = !value;
        if ($isSmallViewport) {
            setTimeout(() => {
                [rangeOverlayEl, fadeBottomOverlayEl].forEach((el) => {
                    if (el) {
                        el.style.opacity = value ? '0' : '1';
                    }
                });
            }, 0);
        }

        const currentScrollLeft = hScroller?.scrollLeft || 0;

        tick().then(() => {
            if (hScroller) {
                hScroller.scrollLeft = currentScrollLeft;
            }
        });
    }

    function updateColumn(columnId: string, updates: Partial<SuggestedColumnSchema>) {
        const columnIndex = customColumns.findIndex((col) => col.key === columnId);
        if (columnIndex !== -1) {
            customColumns[columnIndex] = { ...customColumns[columnIndex], ...updates };
        }
    }

    function getColumn(columnId: string) {
        return customColumns.find((col) => col.key === columnId);
    }

    function getColumnOption(type: string, format?: string | null) {
        return columnOptions.find(
            (option) => option.type === type && (format ? option.format === format : !option.format)
        );
    }

    async function createColumns() {
        creatingColumns = true;
        const client = sdk.forProject(page.params.region, page.params.project);

        try {
            const results = [];

            for (const column of customColumns) {
                const baseParams = {
                    databaseId: page.params.database,
                    tableId: page.params.table,
                    key: column.key,
                    required: column.required || false
                };

                let columnResult: Columns;
                switch (column.type) {
                    case 'string':
                        if (column.format) {
                            switch (column.format) {
                                case 'email':
                                    columnResult =
                                        await client.tablesDB.createEmailColumn(baseParams);
                                    break;
                                case 'ip':
                                    columnResult = await client.tablesDB.createIpColumn(baseParams);
                                    break;
                                case 'url':
                                    columnResult =
                                        await client.tablesDB.createUrlColumn(baseParams);
                                    break;
                                case 'enum':
                                    columnResult = await client.tablesDB.createEnumColumn({
                                        ...baseParams,
                                        elements: []
                                    });
                                    break;
                                default:
                                    columnResult = await client.tablesDB.createStringColumn({
                                        ...baseParams,
                                        size: column.size || 255,
                                        xdefault: (column.default as string) || null
                                    });
                                    break;
                            }
                        } else {
                            columnResult = await client.tablesDB.createStringColumn({
                                ...baseParams,
                                size: column.size || 255,
                                xdefault: (column.default as string) || null
                            });
                        }
                        break;

                    case 'integer':
                        columnResult = await client.tablesDB.createIntegerColumn({
                            ...baseParams,
                            min: column.min,
                            max: column.max,
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'double':
                        columnResult = await client.tablesDB.createFloatColumn({
                            ...baseParams,
                            min: column.min,
                            max: column.max,
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'boolean':
                        columnResult = await client.tablesDB.createBooleanColumn({
                            ...baseParams,
                            xdefault: (column.default as boolean) || null
                        });
                        break;

                    case 'datetime':
                        columnResult = await client.tablesDB.createDatetimeColumn({
                            ...baseParams,
                            xdefault: (column.default as string) || null
                        });
                        break;

                    case 'point':
                        columnResult = await client.tablesDB.createPointColumn(baseParams);
                        break;

                    case 'linestring':
                        columnResult = await client.tablesDB.createLineColumn(baseParams);
                        break;

                    case 'polygon':
                        columnResult = await client.tablesDB.createPolygonColumn(baseParams);
                        break;
                }

                results.push(columnResult);
            }

            await invalidate(Dependencies.TABLE);

            addNotification({
                type: 'success',
                message: 'Columns created successfully'
            });

            trackEvent(Submit.ColumnCreate, { type: 'suggestions' });
        } catch (error) {
            trackError(error, Submit.ColumnCreate);
            addNotification({
                type: 'error',
                message: error.message
            });
            creatingColumns = false;
        }
    }

    onDestroy(() => {
        resizeObserver?.disconnect();
        hScroller?.removeEventListener('scroll', recalcAllThrottled);
        if (scrollAnimationFrame) {
            cancelAnimationFrame(scrollAnimationFrame);
        }

        customColumns = [];
        resetSuggestionsStore();
    });

    function isCustomColumn(id: string) {
        return !['$id', '$createdAt', '$updatedAt', 'actions'].includes(id);
    }
</script>

<svelte:window on:resize={recalcAll} on:scroll={recalcAll} />

<div
    bind:this={spreadsheetContainer}
    class:custom-columns={customColumns.length > 0}
    class="databases-spreadsheet spreadsheet-container-outer"
    style:--overlay-icon-color="#fd366e99"
    style:--non-overlay-icon-color="--fgcolor-neutral-weak">
    <div>
        <div
            aria-hidden="true"
            bind:this={rangeOverlayEl}
            class="columns-range-overlay"
            class:no-transition={hasTransitioned && customColumns.length > 0}
            class:thinking={$tableColumnSuggestions.thinking || creatingColumns}>
        </div>
    </div>

    <SpreadsheetContainer>
        <Spreadsheet.Root
            {emptyCells}
            allowSelection
            height="100%"
            columns={spreadsheetColumns}
            bottomActionClick={() => {}}>
            <svelte:fragment slot="header" let:root>
                {#each spreadsheetColumns as column, index (index)}
                    {@const isColumnInteractable = isCustomColumn(column.id)}
                    {#if column.isAction}
                        <Spreadsheet.Header.Cell column="actions" {root}>
                            <Button.Button icon variant="extra-compact">
                                <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                            </Button.Button>
                        </Spreadsheet.Header.Cell>
                    {:else}
                        {@const columnObj = getColumn(column.id)}
                        {@const columnIcon = basicColumnOptions.find(
                            (col) => col.type === columnObj?.type
                        )?.icon}
                        {@const columnIconColor = !columnObj?.type
                            ? '--non-overlay-icon-color'
                            : '--overlay-icon-color'}

                        <Options
                            enabled={isColumnInteractable}
                            onShowStateChanged={onPopoverShowStateChanged}>
                            {#snippet children(toggle)}
                                <Spreadsheet.Header.Cell
                                    {root}
                                    isEditable={!$isTabletViewport}
                                    openEditOnTap={!$isTabletViewport}
                                    column={column.id}
                                    on:contextmenu={(event) => {
                                        // tablet viewport check because context-menu
                                        // can be triggered on long hold clicks as well!
                                        if (isColumnInteractable && !$isTabletViewport) {
                                            toggle(event);
                                        }
                                    }}>
                                    <Layout.Stack
                                        direction="row"
                                        alignItems="center"
                                        alignContent="center"
                                        justifyContent="space-between">
                                        {column.title}

                                        <Popover let:toggle portal padding="none">
                                            <Button.Button
                                                size="xs"
                                                variant="extra-compact"
                                                disabled={!isColumnInteractable}
                                                on:click={(event) => {
                                                    if (isColumnInteractable) {
                                                        toggle(event);
                                                    }
                                                }}>
                                                <Icon
                                                    size="s"
                                                    color={columnIconColor}
                                                    icon={column.icon ?? undefined} />
                                            </Button.Button>

                                            <div
                                                let:toggle
                                                slot="tooltip"
                                                class="actions-menu-wrapper">
                                                <ActionMenu.Root width="228px">
                                                    <Layout.Stack
                                                        gap="none"
                                                        direction="column"
                                                        class="filter-modal-actions-menu variant">
                                                        {#each basicColumnOptions as option}
                                                            <ActionMenu.Item.Button
                                                                on:click={() => {
                                                                    toggle();
                                                                    updateColumn(column.id, {
                                                                        type: option.type,
                                                                        format:
                                                                            option.format || null
                                                                    });
                                                                }}>
                                                                <Layout.Stack
                                                                    gap="s"
                                                                    direction="row"
                                                                    alignContent="center">
                                                                    <Icon icon={option.icon} />
                                                                    {option.name}
                                                                </Layout.Stack>
                                                            </ActionMenu.Item.Button>
                                                        {/each}
                                                    </Layout.Stack>
                                                </ActionMenu.Root>
                                            </div>
                                        </Popover>
                                    </Layout.Stack>

                                    <svelte:fragment slot="cell-editor">
                                        {#if !$isTabletViewport}
                                            <div class="cell-editor">
                                                <InputText
                                                    id="key"
                                                    autofocus
                                                    required
                                                    bind:value={columnObj.key}
                                                    pattern="^[A-Za-z0-9][A-Za-z0-9._\-]*$">
                                                    <svelte:fragment slot="end">
                                                        {#if columnIcon}
                                                            <Icon
                                                                size="s"
                                                                icon={columnIcon}
                                                                color={columnIconColor} />
                                                        {/if}
                                                    </svelte:fragment>
                                                </InputText>
                                            </div>
                                        {/if}
                                    </svelte:fragment>
                                </Spreadsheet.Header.Cell>
                            {/snippet}

                            {#snippet tooltipChildren()}
                                {#if columnObj}
                                    {@const selectedOption = getColumnOption(
                                        columnObj.type,
                                        columnObj.format
                                    )}
                                    {@const ColumnComponent = selectedOption?.component}
                                    <Layout.Stack gap="xl">
                                        <Layout.Stack
                                            direction={$isSmallViewport ? 'column' : 'row'}>
                                            <InputText
                                                id="key"
                                                label="Key"
                                                placeholder="Enter key"
                                                bind:value={columnObj.key}
                                                autofocus
                                                required
                                                pattern="^[A-Za-z0-9][A-Za-z0-9._\-]*$" />

                                            <InputSelect
                                                id="type"
                                                required
                                                label="Type"
                                                value={selectedOption?.name || 'String'}
                                                on:change={(e) => {
                                                    const newOption = columnOptions.find(
                                                        (opt) => opt.name === e.detail
                                                    );
                                                    if (newOption) {
                                                        updateColumn(column.id, {
                                                            type: newOption.type,
                                                            format: newOption.format || null
                                                        });
                                                    }
                                                }}
                                                options={basicColumnOptions.map((col) => {
                                                    return {
                                                        label: col.name,
                                                        value: col.name,
                                                        leadingIcon: col.icon
                                                    };
                                                })} />
                                        </Layout.Stack>

                                        {#if ColumnComponent}
                                            <ColumnComponent data={columnObj} />
                                        {/if}
                                    </Layout.Stack>
                                {/if}
                            {/snippet}
                        </Options>
                    {/if}
                {/each}
            </svelte:fragment>
        </Spreadsheet.Root>
    </SpreadsheetContainer>

    <div
        bind:this={fadeBottomOverlayEl}
        class="spreadsheet-fade-bottom"
        data-collapsed-tabs={!$expandTabs}>
    </div>

    {#if $tableColumnSuggestions.thinking}
        <div class="floating-action-wrapper">
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Layout.Stack direction="row" gap="xxs" alignItems="center">
                        <Spinner size="s" />
                        <Typography.Text style="white-space: nowrap">
                            Thinking of column suggestions
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button.Button
                        size="xs"
                        variant="secondary"
                        on:click={() => resetSuggestionsStore()}
                        >Cancel
                    </Button.Button>
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {:else if customColumns.length > 0 && showFloatingBar}
        <div
            class="floating-action-wrapper"
            class:expanded={!creatingColumns}
            class:creating-columns={creatingColumns}>
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Layout.Stack gap="xl" direction="row" alignItems="center">
                        {#if creatingColumns}
                            <Spinner size="s" />
                        {/if}

                        <Typography.Text style="white-space: nowrap">
                            {creatingColumns
                                ? 'Creating columns...'
                                : $isSmallViewport
                                  ? 'Review and edit columns'
                                  : 'Review and edit suggested columns before applying'}
                        </Typography.Text>
                    </Layout.Stack>
                </svelte:fragment>

                <svelte:fragment slot="end">
                    {#if !creatingColumns}
                        <Layout.Stack direction="row" gap="xs" alignItems="center" inline>
                            <Button.Button
                                size="xs"
                                variant="text"
                                on:click={() => (confirmDismiss = true)}
                                >Dismiss
                            </Button.Button>
                            <Button.Button size="xs" variant="primary" on:click={createColumns}
                                >Apply
                            </Button.Button>
                        </Layout.Stack>
                    {/if}
                </svelte:fragment>
            </FloatingActionBar>
        </div>
    {/if}
</div>

<Confirm
    confirmDeletion
    action="Dismiss"
    title="Dismiss columns"
    bind:open={confirmDismiss}
    onSubmit={() => {
        customColumns = [];
        resetSuggestionsStore();
    }}>
    Are you sure you want to dismiss these columns suggested by AI? This action is irreversible.
</Confirm>

<style lang="scss">
    .spreadsheet-container-outer {
        width: 100%;
        position: fixed;
        overflow: hidden;
        scrollbar-width: none;

        &.custom-columns {
            width: unset;
        }

        & :global([role='rowheader'] :nth-last-child(2) [role='presentation']) {
            display: none;
        }

        .columns-range-overlay {
            position: absolute;
            left: var(--group-left, 0px);
            width: var(--group-width, 100%);
            height: 100%;
            background: color-mix(in oklab, #fd366e 7%, transparent);
            pointer-events: none;
            z-index: 21;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

            &.no-transition {
                transition: opacity 500ms ease-in-out;
            }

            /* pretty gradient wash (with fallback) */
            background: rgba(253, 54, 110, 0.07);
            @supports (background: color-mix(in oklab, #fd366e 7%, transparent)) {
                background: linear-gradient(
                    135deg,
                    color-mix(in oklab, #fd366e 7%, transparent) 0%,
                    color-mix(in oklab, #fe9567 7%, transparent) 100%
                );
            }

            &.thinking {
                margin-block-start: 2px;
                height: calc(100% - 4px);
                border-radius: var(--border-radius-S, 8px);
                box-shadow:
                    0 0 0 var(--border-width-l, 2px) #fd366e,
                    inset 0 0 0 1px color-mix(in oklab, #fe9567 20%, transparent);

                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.08),
                        transparent
                    );
                    animation: inner-shimmer 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                }
            }
        }

        & .floating-action-wrapper {
            & :global(:first-child) {
                z-index: 21;
                transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);
            }

            &.expanded :global(:first-child) {
                left: calc(60% - 525px / 2);
                max-width: 525px !important;

                @media (max-width: 1024px) {
                    left: calc(50% - 525px / 2);
                }

                @media (max-width: 768px) {
                    left: calc(50% - 400px / 2);
                    max-width: 400px !important;
                }
            }

            &.creating-columns :global(:first-child) {
                left: calc(50% - 300px / 2);
                max-width: 300px !important;
            }
        }

        & :global(.spreadsheet-container) {
            overflow-x: hidden;
            overflow-y: hidden;
            scrollbar-width: none;
        }

        & :global([data-select='true']) {
            opacity: 0.85;
            pointer-events: none;
        }

        /* alternative selector for header selection */
        & :global(.sticky-header [data-select='true']) {
            opacity: 1;
            pointer-events: none;
        }
    }

    .spreadsheet-fade-bottom {
        bottom: 0;
        width: 100%;
        position: fixed;
        height: var(--overlay-height);
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.855) 21%,
            #fff 100%
        );
        z-index: 20; /* under overlay */
        display: flex;
        justify-content: center;
        transition:
            opacity 500ms ease-in-out,
            height 300ms cubic-bezier(0.4, 0, 0.2, 1);

        pointer-events: none;
    }

    :global(.theme-dark) .spreadsheet-fade-bottom {
        background: linear-gradient(
            180deg,
            rgba(25, 25, 28, 0.38) 13%,
            rgba(25, 25, 28, 0.7) 21%,
            rgba(25, 25, 28, 0.95) 38%,
            var(--bgcolor-neutral-default, #19191c) 100%
        );
    }

    @keyframes inner-shimmer {
        0% {
            left: -100%;
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            left: 100%;
            opacity: 0;
        }
    }

    :global(.theme-dark) .columns-range-overlay.thinking {
        &::before {
            background: linear-gradient(
                90deg,
                rgba(253, 54, 110, 0.01),
                rgba(254, 149, 103, 0.03),
                rgba(253, 54, 110, 0.01),
                rgba(254, 149, 103, 0.03),
                rgba(253, 54, 110, 0.01)
            );
        }

        &::after {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
        }
    }

    :global(.cell-editor) {
        width: 100%;
        margin-inline-start: -1.5px;
    }

    :global(.cell-editor .input) {
        display: inline-flex;
        align-items: center !important;
        background: rgba(253, 54, 110, 0.12);
        border: var(--border-width-L, 2px) solid rgba(253, 54, 110, 0.24) !important;

        & :global(i) {
            margin-inline-end: 8px !important;
        }

        & :global(::selection) {
            background: var(--brand-pink-200, #feafc5) !important;
        }
    }

    :global(.filter-modal-actions-menu.variant) {
        max-height: 184px;
    }
</style>
