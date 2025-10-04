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
    import { SpreadsheetContainer } from '$database/(entity)';
    import { onDestroy, onMount } from 'svelte';
    import { debounce } from '$lib/helpers/debounce';
    import { expandTabs, spreadsheetLoading } from '$database/table-[table]/store';

    type Mode = 'rows' | 'rows-filtered' | 'indexes';

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
    let dynamicOverlayHeight = $state('60.5vh');

    const baseColProps = { draggable: false, resizable: false };

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
        }
    });

    onDestroy(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
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

    const spreadsheetColumns = $derived(mode === 'rows' ? getRowColumns() : getIndexesColumns());

    const emptyCells = $derived(
        ($isSmallViewport ? 14 : $isTabletViewport ? 17 : 24) + (!$expandTabs ? 2 : 0)
    );
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
                            if (columnActionsById && mode === 'rows') {
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
            style:--dynamic-overlay-height={dynamicOverlayHeight}>
            <div class="empty-actions">
                <Layout.Stack gap="xl" alignItems="center">
                    <Typography.Title>{title ?? `You have no ${mode} yet`}</Typography.Title>

                    {#if showActions}
                        <Layout.Stack
                            inline
                            gap="s"
                            alignItems="center"
                            direction={$isSmallViewport ? 'column' : 'row'}>
                            {#if mode !== 'rows-filtered'}
                                <Button.Button
                                    icon
                                    size="s"
                                    variant="secondary"
                                    disabled={actions?.primary?.disabled}
                                    onclick={actions?.primary?.onClick}>
                                    <Icon icon={IconPlus} size="s" />
                                    {actions?.primary?.text ?? `Create ${mode}`}
                                </Button.Button>

                                {#if mode === 'rows'}
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

        &[data-mode='rows'] {
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
        bottom: 0;
        width: 100%;
        position: fixed;
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.855) 21%,
            #ffffff 100%
        );
        z-index: 20;
        display: flex;
        justify-content: center;
        transition: none !important;

        height: var(--dynamic-overlay-height, 70.5vh);

        @media (max-width: 1024px) {
            height: var(--dynamic-overlay-height, 63.35vh);
        }

        @media (min-width: 1024px) {
            height: var(--dynamic-overlay-height, 70.35vh);
        }
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

    .empty-actions {
        left: 50%;
        bottom: 35%;
        position: fixed;

        @media (max-width: 768px) and (max-height: 768px) {
            left: unset;
            bottom: 12.5% !important;
        }

        @media (max-width: 768px) and (max-height: 1024px) {
            left: unset;
            bottom: 15% !important;
        }

        @media (max-width: 1024px) and (max-height: 1024px) {
            left: unset;
            bottom: 15%;
        }

        @media (max-width: 1024px) {
            left: unset;
            bottom: 30%;
        }

        @media (min-width: 1280px) {
            bottom: 37.5%;
        }

        @media (min-width: 1440px) {
            bottom: 40%;
        }
    }
</style>
