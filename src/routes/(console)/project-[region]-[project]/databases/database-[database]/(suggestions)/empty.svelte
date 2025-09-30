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
    import { IconFingerPrint, IconPlus } from '@appwrite.io/pink-icons-svelte';
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
        mockSuggestions,
        createTableRequest,
        showIndexesSuggestions
    } from './store';
    import { addNotification, dismissNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { sleep } from '$lib/helpers/promises';
    import { invalidate, beforeNavigate, goto } from '$app/navigation';
    import { showCreateTable } from '../store';
    import { showSubNavigation } from '$lib/stores/layout';
    import { navigationCancelled } from '$lib/stores/navigation';
    import { Dependencies } from '$lib/constants';
    import { isWithinSafeRange } from '$lib/helpers/numbers';
    import type { Columns } from '../table-[table]/store';
    import { columnOptions } from '../table-[table]/columns/store';
    import Options from './options.svelte';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import { Confirm } from '$lib/components';
    import { isCloud, VARS } from '$lib/system';

    import IconAINotification from './icon/aiNotification.svelte';

    let resizeObserver: ResizeObserver;
    let spreadsheetContainer: HTMLElement;

    let hScroller: HTMLElement | null = null;
    let headerElement: HTMLElement | null = null;
    let rangeOverlayEl: HTMLDivElement | null = null;
    let fadeBottomOverlayEl: HTMLDivElement | null = null;

    let customColumns = $state<
        (SuggestedColumnSchema & { elements?: []; isPlaceholder?: boolean })[]
    >(Array.from({ length: 7 }, (_, index) => createPlaceholderColumn(index)));

    let showFloatingBar = $state(true);
    let hasTransitioned = $state(false);
    let scrollAnimationFrame: number | null = null;

    let confirmDismiss = $state(false);
    let confirmNavigation = $state(false);
    let pendingNavigationUrl: string | null = null;

    let creatingColumns = $state(false);
    const baseColProps = { draggable: false, resizable: false };

    const NOTIFICATION_AND_MOCK_DELAY = 1250;

    const getColumnWidth = (columnKey: string) => Math.max(180, columnKey.length * 8 + 60);
    const safeNumericValue = (value: number | undefined) =>
        value !== undefined && isWithinSafeRange(value) ? value : undefined;

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

        // Custom columns mode: calculate precise overlay bounds
        const containerRect = spreadsheetContainer.getBoundingClientRect();
        const getById = (id: string) =>
            headerElement!.querySelector<HTMLElement>(
                `[role="cell"][data-header="true"][data-column-id="${id}"]`
            );

        const hasRealColumns = customColumns.some((col) => !col.isPlaceholder);
        if (!hasRealColumns) {
            // For placeholders or no columns, position overlay to cover custom columns area
            const idCell = getById('$id');
            const actionsCell = headerElement!.querySelector<HTMLElement>(
                '[role="cell"][data-column-id="actions"]'
            );

            if (idCell && actionsCell) {
                const idRect = idCell.getBoundingClientRect();
                const actionsRect = actionsCell.getBoundingClientRect();
                const left = Math.round(idRect.right - containerRect.left);
                const actionsLeft = actionsRect.left - containerRect.left;

                const width = actionsLeft - left;

                spreadsheetContainer.style.setProperty('--group-left', `${left - 2}px`);
                spreadsheetContainer.style.setProperty('--group-width', `${width + 2}px`);
            } else {
                spreadsheetContainer.style.setProperty('--group-left', '40px');
                spreadsheetContainer.style.setProperty('--group-width', 'calc(100% - 80px)');
            }
            return;
        }

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

        // get the actions column and use its left border as the boundary
        const actionsCell = headerElement!.querySelector<HTMLElement>(
            '[role="cell"][data-column-id="actions"]'
        );

        if (!actionsCell) {
            if (rangeOverlayEl) {
                rangeOverlayEl.style.display = 'none';
            }
            return;
        }

        const actionsRect = actionsCell.getBoundingClientRect();
        const actionsLeft = actionsRect.left - containerRect.left;

        const width = actionsLeft - left;

        // Apply overlay positioning
        spreadsheetContainer.style.setProperty('--group-left', `${left - 2}px`);
        spreadsheetContainer.style.setProperty('--group-width', `${width + 2}px`);
    };

    // only for mobile, we can remove if not needed!
    const scrollToFirstCustomColumn = () => {
        if (!$isSmallViewport) return;

        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
        }

        if (!headerElement) return;

        const firstCustomColumnCell = headerElement.querySelector<HTMLElement>(
            `[role="cell"][data-header="true"][data-column-id="${customColumns[0]?.key}"]`
        );

        const directAccessScroller =
            hScroller ??
            findHorizontalScroller(headerElement) ??
            // internal spreadsheet root main container!
            spreadsheetContainer.querySelector('.spreadsheet-container');

        if (firstCustomColumnCell && directAccessScroller) {
            const cellRect = firstCustomColumnCell.getBoundingClientRect();
            const scrollerRect = directAccessScroller.getBoundingClientRect();
            const scrollLeft =
                directAccessScroller.scrollLeft + cellRect.left - scrollerRect.left - 40;

            directAccessScroller.scrollTo({
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

    // Handle create table requests from subNavigation
    const unsubscribeCreateTable = createTableRequest.subscribe((requested) => {
        if (requested) {
            const hasRealColumns = customColumns.some((col) => !col.isPlaceholder);
            if (hasRealColumns && !creatingColumns) {
                confirmNavigation = true;
                pendingNavigationUrl = 'create-table';
            } else {
                executeCreateTable();
            }

            createTableRequest.set(false);
        }
    });

    function executeCreateTable() {
        $showCreateTable = true;
        $showSubNavigation = false;
    }

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
                width: { min: getColumnWidth(col.key) },
                icon: columnOption?.icon,
                draggable: false,
                resizable: false
            };
        });
    });

    const getRowColumns = (): Column[] => {
        const minColumnWidth = 180;
        const fixedWidths = { id: minColumnWidth, actions: 40, selection: 40 };

        // calculate base widths and total
        const columnsWithBase = customSuggestedColumns.map((col) => ({
            ...col,
            baseWidth: Math.max(minColumnWidth, getColumnWidth(col.id))
        }));

        const totalUsed =
            fixedWidths.id +
            fixedWidths.actions +
            fixedWidths.selection +
            columnsWithBase.reduce((sum, col) => sum + col.baseWidth, 0);

        // distribute excess space equally across custom columns
        const viewportWidth = spreadsheetContainer?.clientWidth || window.innerWidth;
        const extraPerColumn =
            Math.max(0, viewportWidth - totalUsed) / (columnsWithBase.length || 1);

        const finalCustomColumns = columnsWithBase.map((col) => ({
            ...col,
            width: { min: col.baseWidth + extraPerColumn }
        }));

        return [
            {
                id: '$id',
                title: '$id',
                type: 'string',
                width: fixedWidths.id,
                icon: IconFingerPrint,
                ...baseColProps
            },
            ...finalCustomColumns,
            {
                id: 'actions',
                title: '',
                type: 'string' as Column['type'],
                width: fixedWidths.actions,
                isAction: true,
                ...baseColProps
            }
        ];
    };

    // Handle browser back/forward navigation
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        const hasRealColumns = customColumns.some((col) => !col.isPlaceholder);
        if (hasRealColumns && !creatingColumns) {
            event.preventDefault();
            event.returnValue =
                'You have unsaved column suggestions. Are you sure you want to leave?';
            return event.returnValue;
        }
    };

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

    beforeNavigate(({ cancel, to }) => {
        const hasRealColumns = customColumns.some((col) => !col.isPlaceholder);
        if (hasRealColumns && !creatingColumns) {
            cancel();
            confirmNavigation = true;
            $navigationCancelled = true;
            pendingNavigationUrl = to?.url?.pathname || null;
        }
    });

    function resetSuggestionsStore(fullReset: boolean = true) {
        if ($tableColumnSuggestions.table?.id !== page.params.table) {
            return;
        }

        if (fullReset) {
            // these are referenced in
            // `table-[table]/+page.svelte`
            $tableColumnSuggestions.table = null;
            $tableColumnSuggestions.enabled = false;
        }

        $tableColumnSuggestions.context = null;
        $tableColumnSuggestions.thinking = false;
    }

    async function suggestColumns() {
        $tableColumnSuggestions.thinking = true;

        if ($isSmallViewport) {
            await tick();
            scrollToFirstCustomColumn();
        }

        let suggestedColumns: {
            total: number;
            columns: ColumnInput[];
        } = {
            total: 0,
            columns: []
        };

        try {
            if (VARS.MOCK_AI_SUGGESTIONS) {
                /* animation */
                await sleep(NOTIFICATION_AND_MOCK_DELAY);
                suggestedColumns = mockSuggestions;
            } else {
                suggestedColumns = (await sdk
                    .forProject(page.params.region, page.params.project)
                    .console.suggestColumns({
                        databaseId: page.params.database,
                        tableId: page.params.table,
                        context: $tableColumnSuggestions.context ?? undefined,
                        min: 6 // TODO: to not break the sheet layout's width!
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

            const mappedColumns = mapSuggestedColumns(suggestedColumns.columns);

            // replace with actual columns and trim excess
            if (mappedColumns.length < customColumns.length) {
                customColumns = customColumns.slice(0, mappedColumns.length);
            }

            // replace existing placeholders and
            // add any additional columns if needed
            mappedColumns.forEach((column, index) => {
                setTimeout(() => {
                    if (index < customColumns.length) {
                        // replace existing placeholder
                        customColumns[index] = { ...column, isPlaceholder: false };
                    } else {
                        // new column directly if we have more than expected
                        // just added in case the max ever changes on backend!
                        customColumns.push({ ...column, isPlaceholder: false });
                    }

                    // recalculate overlay bounds
                    // after each column is populated!
                    requestAnimationFrame(() => updateOverlayBounds());
                }, index * 150);
            });

            if (mappedColumns.length > 0) {
                setTimeout(
                    () => {
                        hasTransitioned = true;
                        // final recal after
                        // all animations complete
                        requestAnimationFrame(() => {
                            recalcAll();
                        });
                    },
                    mappedColumns.length * 150 + 300
                );
            }

            resetSuggestionsStore(false);
        } catch (error) {
            // remove completely!
            resetSuggestionsStore();

            // track & notify!
            trackError(error, Submit.ColumnSuggestions);
            addNotification({ type: 'error', message: error.message });
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

    function isCustomColumn(id: string) {
        return !['$id', '$createdAt', '$updatedAt', 'actions'].includes(id);
    }

    function showIndexSuggestionsNotification() {
        // safeguard anyways!
        if (!isCloud) return;

        setTimeout(() => {
            const notifId = addNotification({
                isHtml: true,
                title: '<b>Next step: Add indexes</b>',
                message: 'See suggested indexes based on your columns',
                dismissible: true,
                icon: IconAINotification,
                timeout: 10000, // ten seconds
                buttons: [
                    {
                        name: 'Create indexes',
                        method: () => {
                            dismissNotification(notifId);
                            showIndexesSuggestions.update(() => true);
                        }
                    }
                ]
            });
        }, NOTIFICATION_AND_MOCK_DELAY);
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
                                        elements: column.elements ?? []
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
                            min: safeNumericValue(column.min),
                            max: safeNumericValue(column.max),
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'double':
                        columnResult = await client.tablesDB.createFloatColumn({
                            ...baseParams,
                            min: safeNumericValue(column.min),
                            max: safeNumericValue(column.max),
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
                message: 'Columns created successfully',
                timeout: NOTIFICATION_AND_MOCK_DELAY
            });

            // show index notification!
            showIndexSuggestionsNotification();

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

    function createPlaceholderColumn(
        index: number
    ): SuggestedColumnSchema & { elements?: []; isPlaceholder?: boolean } {
        return {
            key: `column${index + 1}`,
            type: 'string',
            required: false,
            default: null,
            format: null,
            size: undefined,
            min: undefined,
            max: undefined,
            elements: undefined,
            isPlaceholder: true
        };
    }

    onDestroy(() => {
        resizeObserver?.disconnect();
        hScroller?.removeEventListener('scroll', recalcAllThrottled);
        if (scrollAnimationFrame) {
            cancelAnimationFrame(scrollAnimationFrame);
        }

        customColumns = [];
        resetSuggestionsStore();
        unsubscribeCreateTable();
    });
</script>

<svelte:window on:resize={recalcAll} on:scroll={recalcAll} on:beforeunload={handleBeforeUnload} />

<div
    bind:this={spreadsheetContainer}
    class:custom-columns={customColumns.length > 0}
    class:thinking={$tableColumnSuggestions.thinking}
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
                        {@const isColumnInteractable =
                            isCustomColumn(column.id) && !columnObj.isPlaceholder}

                        <Options
                            enabled={isColumnInteractable}
                            onShowStateChanged={onPopoverShowStateChanged}>
                            {#snippet children(toggle)}
                                <Spreadsheet.Header.Cell
                                    {root}
                                    isEditable={isColumnInteractable && !$isTabletViewport}
                                    openEditOnTap={isColumnInteractable && !$isTabletViewport}
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
                                        <span
                                            class="column-title"
                                            class:animate-in={!columnObj?.isPlaceholder}
                                            style:--animation-delay={`${isColumnInteractable ? (index - 1) * 100 : 0}ms`}>
                                            {column.title}
                                        </span>

                                        <Popover
                                            let:toggle
                                            portal
                                            padding="none"
                                            placement="bottom-start">
                                            <div
                                                class="column-icon-wrapper"
                                                class:animate-in={!columnObj?.isPlaceholder}
                                                style:--animation-delay={`${isColumnInteractable ? (index - 1) * 100 : 0}ms`}>
                                                <Button.Button
                                                    size="xs"
                                                    variant="extra-compact"
                                                    disabled={!isColumnInteractable}
                                                    on:click={(event) => {
                                                        if (
                                                            isColumnInteractable &&
                                                            !$isTabletViewport
                                                        ) {
                                                            toggle(event);
                                                        }
                                                    }}>
                                                    {#if !columnObj?.isPlaceholder}
                                                        <Icon
                                                            size="s"
                                                            color={columnIconColor}
                                                            icon={column.icon ?? undefined} />
                                                    {/if}
                                                </Button.Button>
                                            </div>

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
                        <Typography.Caption
                            variant="500"
                            color="--fgcolor-neutral-secondary"
                            style="white-space: nowrap">
                            Thinking of column suggestions
                        </Typography.Caption>
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
    {:else if customColumns.some((col) => !col.isPlaceholder) && showFloatingBar}
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

                        <Typography.Caption
                            variant="500"
                            color="--fgcolor-neutral-secondary"
                            style="white-space: nowrap">
                            {creatingColumns
                                ? 'Creating columns'
                                : $isSmallViewport
                                  ? 'Review and edit suggested columns'
                                  : 'Review and edit suggested columns before applying'}
                        </Typography.Caption>
                    </Layout.Stack>
                </svelte:fragment>

                <svelte:fragment slot="end">
                    <Layout.Stack direction="row" gap="xs" alignItems="center" inline>
                        <Button.Button
                            size="xs"
                            variant="text"
                            disabled={creatingColumns}
                            on:click={() => (confirmDismiss = true)}
                            style="opacity: {creatingColumns ? '0' : '1'}"
                            >Dismiss
                        </Button.Button>
                        <Button.Button
                            size="xs"
                            variant="primary"
                            disabled={creatingColumns}
                            on:click={createColumns}
                            style="opacity: {creatingColumns ? '0' : '1'}"
                            >Apply
                        </Button.Button>
                    </Layout.Stack>
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

<Confirm
    confirmDeletion
    action="Leave"
    title="Leave page"
    bind:open={confirmNavigation}
    onSubmit={() => {
        customColumns = [];
        resetSuggestionsStore();
        confirmNavigation = false;

        if (pendingNavigationUrl) {
            if (pendingNavigationUrl === 'create-table') {
                executeCreateTable();
            } else {
                goto(pendingNavigationUrl);
            }

            pendingNavigationUrl = null;
        }
    }}>
    You have unsaved column suggestions. If you leave this page, you'll lose these suggestions. Are
    you sure you want to continue?
</Confirm>

<style lang="scss">
    .spreadsheet-container-outer {
        width: 100%;
        position: fixed;
        overflow: visible;
        scrollbar-width: none;

        &.custom-columns {
            width: unset;
        }

        & :global([role='rowheader'] :nth-last-child(2) [role='presentation']) {
            display: none;
        }

        &:not(:has(.columns-range-overlay.thinking)) {
            &
                :global(
                    [role='cell']:has(.column-resizer-disabled):not([data-column-id^='$']):not(
                            [data-column-id='actions']
                        )
                ) {
                box-shadow: 0 -1px 0 0 rgba(253, 54, 110, 0.24) inset !important;
                transition: box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            & :global([role='cell']:not([data-column-id='actions']) .column-resizer-disabled) {
                border-left: var(--border-width-s, 1px) solid rgba(253, 54, 110, 0.24) !important;
                transition: border-color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
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
                left: calc(65% - 525px / 2);
                transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);

                @media (max-width: 1024px) {
                    left: calc(50% - 525px / 2);
                }

                @media (max-width: 768px) {
                    left: calc(50% - 400px / 2);
                    max-width: 400px !important;
                }
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
                left: calc(67.5% - 525px / 2);
                max-width: 300px !important;

                @media (max-width: 1024px) {
                    left: calc(60% - 300px / 2);
                }

                @media (max-width: 768px) {
                    left: calc(50% - 400px / 2);
                    max-width: 400px !important;
                }
            }
        }

        & :global(.spreadsheet-container) {
            overflow-x: auto;
            overflow-y: auto;
            scrollbar-width: none;
        }

        &.thinking {
            & :global(.spreadsheet-container) {
                overflow: hidden !important;
            }
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
        transition: opacity 500ms ease-in-out;

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
            margin-inline-end: 6px !important;
            margin-block-start: -4px !important;
        }

        & :global(::selection) {
            background: var(--brand-pink-200, #feafc5) !important;
        }
    }

    :global(.filter-modal-actions-menu.variant) {
        max-height: 184px;
    }

    /* Sequential animation for column titles and icons */
    .column-title,
    .column-icon-wrapper {
        opacity: 0;
        transform: translateY(4px);
        transition:
            opacity 0.4s ease-out,
            transform 0.4s ease-out;
    }

    .column-title.animate-in,
    .column-icon-wrapper.animate-in {
        opacity: 1;
        transform: translateY(0);
        transition-delay: var(--animation-delay, 0ms);
    }
</style>
