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
    import { isSmallViewport } from '$lib/stores/viewport';
    import { SortButton } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import {
        tableColumns,
        columnsOrder,
        showCreateAttributeSheet,
        spreadsheetLoading,
        expandTabs
    } from '../store';
    import { onMount } from 'svelte';
    import SpreadsheetContainer from './spreadsheet.svelte';

    type Mode = 'rows' | 'indexes';

    interface Action {
        text?: string;
        disabled?: boolean;
        onClick?: () => void;
    }

    const {
        mode,
        showActions = true,
        customColumns = [],
        title,
        actions
    } = $props<{
        mode: Mode;
        showActions?: boolean;
        customColumns?: Column[];
        title?: string;
        actions?: {
            primary?: Action;
            random?: Action;
        };
    }>();

    let spreadsheetContainer: HTMLElement;
    let headerElement: HTMLElement | null = null;
    let dynamicOverlayHeight = $state('70.5vh');

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

    onMount(updateOverlayHeight);

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

    const emptyCells = $derived(($isSmallViewport ? 14 : 17) + (!$expandTabs ? 2 : 0));
</script>

<svelte:window on:resize={updateOverlayHeight} />

<div class="spreadsheet-container-outer" data-mode={mode} bind:this={spreadsheetContainer}>
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
                        style:cursor={columnActionsById ? 'pointer' : null}
                        onclick={() => {
                            if (columnActionsById && mode === 'rows') {
                                $showCreateAttributeSheet.show = true;
                                $showCreateAttributeSheet.title = 'Create column';
                                $showCreateAttributeSheet.columns = $tableColumns;
                                $showCreateAttributeSheet.columnsOrder = $columnsOrder;
                            }
                        }}>
                        <Spreadsheet.Header.Cell
                            {root}
                            column={column.id}
                            icon={column.icon ?? undefined}>
                            {#if column.isAction}
                                <Button.Button
                                    icon
                                    variant="extra-compact"
                                    on:click={() => {
                                        console.log('dank');
                                    }}>
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
                            alignItems="center"
                            direction={$isSmallViewport ? 'column' : 'row'}
                            gap="s">
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
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);

        height: var(--dynamic-overlay-height, 70.5vh);

        &[data-collapsed-tabs='true'] {
            height: calc(var(--dynamic-overlay-height, 79.1vh) + 8.6vh);
        }

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
        bottom: 30%;
        position: fixed;

        @media (min-width: 1024px) {
            left: 50%;
            bottom: 40%;
        }
    }
</style>
