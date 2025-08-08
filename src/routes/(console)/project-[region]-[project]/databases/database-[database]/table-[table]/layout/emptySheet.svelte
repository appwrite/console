<script lang="ts">
    import {
        Badge,
        Button,
        Icon,
        Layout,
        Skeleton,
        Spreadsheet,
        Typography
    } from '@appwrite.io/pink-svelte';

    import {
        IconCalendar,
        IconFingerPrint,
        IconHashtag,
        IconPlus
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { SortButton } from '$lib/components';
    import type { Column } from '$lib/helpers/types';
    import {
        tableColumns,
        columnsOrder,
        showCreateAttributeSheet,
        spreadsheetLoading
    } from '../store';

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

    const baseColProps = { draggable: false, resizable: false };

    const getCustomColumns = (): Column[] =>
        customColumns.map((col: Column) => ({
            ...baseColProps,
            width: 180,
            ...col
        }));

    const getRowColumns = (): Column[] => [
        {
            id: '$sequence',
            title: 'Sequence',
            type: 'string',
            width: 225,
            isPrimary: true,
            icon: IconHashtag,
            ...baseColProps
        },
        {
            id: '$id',
            title: 'ID',
            type: 'string',
            width: 180,
            icon: IconFingerPrint,
            ...baseColProps
        },
        ...getCustomColumns(),
        {
            id: '$createdAt',
            title: 'Created',
            type: 'datetime',
            width: 180,
            icon: IconCalendar,
            ...baseColProps
        },
        {
            id: '$updatedAt',
            title: 'Updated',
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

    const emptyCells = $derived($isSmallViewport ? 14 : 17);
    const fixedHeight = $derived($isSmallViewport ? '60.75vh' : '74.75vh');
</script>

<div class="spreadsheet-container-outer" data-mode={mode}>
    <Spreadsheet.Root
        {emptyCells}
        allowSelection
        height={fixedHeight}
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

                                {#if column.isPrimary}
                                    <Badge content="Primary key" size="xs" variant="secondary" />
                                {/if}

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

    {#if !$spreadsheetLoading}
        <div class="spreadsheet-fade-bottom">
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

        &[data-mode='indexes'] {
            position: relative;

            & :global(.spreadsheet-container) {
                max-height: 70vh;
                overflow-y: hidden;

                @media (max-width: 768px) {
                    height: 50vh;
                }
            }
        }

        @media (max-width: 768px) {
            position: unset;
        }

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
        top: 29%;
        bottom: 0;
        width: 100%;
        height: 70.5vh;
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

        @media (max-width: 768px) {
            height: 50vh;
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
