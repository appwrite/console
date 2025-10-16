<script lang="ts">
    import {
        Button,
        Icon,
        Layout,
        Skeleton,
        Spreadsheet,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconCalendar, IconFingerPrint, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import { SortButton } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import { getTerminologies, SpreadsheetContainer } from '$database/(entity)';
    import { onDestroy, onMount } from 'svelte';
    import { debounce } from '$lib/helpers/debounce';
    import { expandTabs } from '$database/store';
    import { spreadsheetLoading } from '$database/table-[table]/store';

    type Mode = 'records' | 'records-filtered' | 'indexes';

    interface Action {
        text?: string;
        disabled?: boolean;
        onClick?: () => void;
    }

    const {
        mode,
        title,
        actions,
        showActions = true,
        customColumns = [],
        onOpenCreateColumn
    }: {
        mode: Mode;
        title?: string;
        showActions?: boolean;
        customColumns?: Column[]; // these are filtered with `hide`
        onOpenCreateColumn?: () => Promise<void> | void;
        actions?: {
            primary?: Action;
            random?: Action;
        };
    } = $props();

    let spreadsheetContainer: HTMLElement;
    let headerElement: HTMLElement | null = null;

    let resizeObserver: ResizeObserver;
    let overlayOffsetHandler: ResizeObserver;

    let overlayLeftOffset = $state('0px');
    let overlayTopOffset = $state('auto');
    let dynamicOverlayHeight = $state('60.5vh');

    const baseColProps = { draggable: false, resizable: false };

    const { terminology } = getTerminologies();

    const updateOverlayLeftOffset = () => {
        if (spreadsheetContainer) {
            const containerRect = spreadsheetContainer.getBoundingClientRect();
            overlayLeftOffset = `${containerRect.left}px`;
        }

        // calculate vertical top position
        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer?.querySelector('[role="rowheader"]');
        }

        if (headerElement) {
            const headerRect = headerElement.getBoundingClientRect();
            overlayTopOffset = `${headerRect.bottom}px`;
        }
    };

    const updateOverlayHeight = () => {
        if (!spreadsheetContainer) return;

        if (!headerElement || !headerElement.isConnected) {
            headerElement = spreadsheetContainer.querySelector('[role="rowheader"]');
        }

        if (headerElement) {
            const headerRect = headerElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const dynamicHeight = viewportHeight - headerRect.bottom;

            dynamicOverlayHeight = `${dynamicHeight}px`;
            if (!$expandTabs) {
                dynamicOverlayHeight = `calc(${dynamicHeight}px - 89px)`;
            }
        }
    };

    // the first render is in a pretty quick succession, delay helps!
    const debouncedUpdateOverlayHeight = debounce(() => updateOverlayHeight(), 250);

    onMount(async () => {
        if (spreadsheetContainer) {
            resizeObserver = new ResizeObserver(debouncedUpdateOverlayHeight);
            resizeObserver.observe(spreadsheetContainer);

            overlayOffsetHandler = new ResizeObserver(updateOverlayLeftOffset);
            overlayOffsetHandler.observe(spreadsheetContainer);
        }
    });

    onDestroy(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        if (overlayOffsetHandler) {
            overlayOffsetHandler.disconnect();
        }
    });

    const getCustomColumns = (): Column[] =>
        customColumns.map((col: Column) => ({
            ...col,
            width: 180,
            hide: false,
            ...baseColProps
        }));

    const getRowColumns = (): Column[] => [
        {
            id: '$id',
            title: '$id',
            type: 'string',
            width: 180,
            icon: IconFingerPrint,
            ...baseColProps
        },
        ...getCustomColumns(),
        {
            id: '$createdAt',
            title: '$createdAt',
            type: 'datetime',
            width: 180,
            icon: IconCalendar,
            ...baseColProps
        },
        {
            id: '$updatedAt',
            title: '$updatedAt',
            type: 'datetime',
            width: 180,
            icon: IconCalendar,
            ...baseColProps
        },
        {
            id: 'actions',
            title: '',
            type: 'string',
            icon: IconPlus,
            width: customColumns.length ? 555 : 832,
            ...baseColProps
        },
        {
            id: 'empty',
            title: '',
            type: 'string',
            ...baseColProps
        }
    ];

    const getIndexesColumns = (): Column[] =>
        [
            { id: 'key', title: 'Key', icon: null, isPrimary: false },
            { id: 'type', title: 'Type', icon: null, isPrimary: false },
            { id: 'columns', title: 'Columns', icon: null, isPrimary: false },
            {
                id: 'empty',
                title: '',
                width: 40,
                isAction: true,
                isPrimary: false
            }
        ] as Column[];

    const spreadsheetColumns = $derived(mode === 'records' ? getRowColumns() : getIndexesColumns());

    const emptyCells = $derived(
        ($isSmallViewport ? 14 : $isTabletViewport ? 17 : 24) + (!$expandTabs ? 2 : 0)
    );

    const modeTerminology = $derived(terminology.record.lower.plural);
</script>

<div
    class="databases-spreadsheet spreadsheet-container-outer"
    data-mode={mode}
    bind:this={spreadsheetContainer}>
    <SpreadsheetContainer>
        <Spreadsheet.Root
            {emptyCells}
            allowSelection
            height="100%"
            columns={spreadsheetColumns}
            loading={$spreadsheetLoading}
            bottomActionClick={() => {
                /* @ignore: only for showing the `+` button on footer */
            }}>
            <svelte:fragment slot="header" let:root>
                {#each spreadsheetColumns as column (column.id)}
                    {@const columnActionsById = column.id === 'actions'}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div
                        role="button"
                        tabindex="0"
                        style:cursor={columnActionsById && onOpenCreateColumn ? 'pointer' : null}
                        onclick={() => {
                            if (columnActionsById && mode === 'records') {
                                onOpenCreateColumn?.();
                            }
                        }}>
                        <Spreadsheet.Header.Cell
                            {root}
                            column={column.id}
                            icon={column.icon ?? undefined}>
                            {#if column.isAction}
                                <Button.Button icon variant="extra-compact">
                                    <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                                </Button.Button>
                            {:else if column.id === 'actions' || column.id === 'empty'}
                                {column.title}
                            {:else}
                                <Layout.Stack
                                    gap="xs"
                                    direction="row"
                                    alignItems="center"
                                    alignContent="center">
                                    {column.title}

                                    <SortButton disabled column={column.id} />
                                </Layout.Stack>
                            {/if}
                        </Spreadsheet.Header.Cell>
                    </div>
                {/each}
            </svelte:fragment>

            <svelte:fragment slot="footer">
                {#if $spreadsheetLoading}
                    <Layout.Stack
                        direction="row"
                        alignContent="center"
                        alignItems="center"
                        justifyContent="space-between">
                        <Skeleton variant="line" height={18} width={125} />
                    </Layout.Stack>
                {/if}
            </svelte:fragment>
        </Spreadsheet.Root>
    </SpreadsheetContainer>

    {#if !$spreadsheetLoading}
        <div
            class="spreadsheet-fade-bottom"
            data-collapsed-tabs={!$expandTabs}
            style:--overlay-top={overlayTopOffset}
            style:--overlay-left={overlayLeftOffset}
            style:--dynamic-overlay-height={dynamicOverlayHeight}>
            <div class="empty-actions">
                <Layout.Stack gap="xl" alignItems="center">
                    <Typography.Title
                        >{title ?? `You have no ${modeTerminology} yet`}</Typography.Title>

                    {#if showActions}
                        <Layout.Stack
                            inline
                            gap="s"
                            alignItems="center"
                            direction={$isSmallViewport ? 'column' : 'row'}>
                            {#if mode !== 'records-filtered'}
                                <Button.Button
                                    icon
                                    size="s"
                                    variant="secondary"
                                    disabled={actions?.primary?.disabled}
                                    onclick={actions?.primary?.onClick}>
                                    <Icon icon={IconPlus} size="s" />
                                    {actions?.primary?.text ?? `Create ${mode}`}
                                </Button.Button>

                                {#if mode === 'records'}
                                    <Button.Button
                                        size="s"
                                        variant="secondary"
                                        disabled={actions?.random?.disabled}
                                        onclick={actions?.random?.onClick}>
                                        {actions?.random?.text ?? `Generate sample data`}
                                    </Button.Button>
                                {/if}
                            {:else}
                                <Button.Button
                                    size="s"
                                    variant="secondary"
                                    disabled={actions?.primary?.disabled}
                                    onclick={actions?.primary?.onClick}>
                                    {actions?.primary?.text}
                                </Button.Button>
                            {/if}
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    .spreadsheet-container-outer {
        width: 100%;
        position: fixed;
        overflow: hidden;

        &[data-mode='records'] {
            & :global([role='rowheader'] :nth-last-child(2) [role='presentation']) {
                display: none;
            }
        }

        &[data-mode='indexes'] {
            & :global([role='rowheader'] [role='cell']:nth-last-child(1)) {
                pointer-events: none;

                & :global(button) {
                    opacity: 0.5;
                }
            }
        }

        & :global(.spreadsheet-container) {
            overflow-x: hidden;
            overflow-y: hidden;
        }

        & :global([data-select='true']) {
            opacity: 0.85;
            pointer-events: none;
        }
    }

    .spreadsheet-fade-bottom {
        right: 0;
        bottom: 0;
        position: fixed;
        top: var(--overlay-top, auto);
        left: var(--overlay-left, 0px);
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.86) 32.25%,
            #ffffff 100%
        );
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: none !important;

        height: var(--dynamic-overlay-height, 70.35vh);
    }

    :global(.theme-dark) .spreadsheet-fade-bottom {
        background: linear-gradient(
            180deg,
            rgba(29, 29, 33, 0) 0%,
            rgba(29, 29, 33, 0.86) 21%,
            #1d1d21 100%
        );
    }

    .empty-actions {
        margin-bottom: 10%;
        pointer-events: auto;

        @media (max-width: 1024px) {
            // experiment
            margin-bottom: 15%;
        }
    }
</style>
