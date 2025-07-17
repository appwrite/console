<script lang="ts">
    import {
        Button,
        Icon,
        Layout,
        Spreadsheet,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import type { Column } from '$lib/helpers/types';
    import { IconCalendar, IconFingerPrint, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    type Mode = 'records' | 'columns' | 'indexes';

    type ColumnsMap = Record<Mode, Column[]>;

    type Action = {
        text?: string;
        disabled?: boolean;
        onClick?: () => void;
    };

    export let mode: Mode;
    export let showActions: boolean = true;
    export let title: string | undefined = undefined;
    export let actions:
        | {
              primary?: Action;
              random?: Action;
          }
        | undefined = undefined;

    function makeColumns(...middle: Column[]): Column[] {
        return [
            {
                id: '$id',
                title: 'ID',
                type: 'string',
                width: 200,
                icon: IconFingerPrint
            },
            ...middle,
            {
                id: 'actions',
                title: '',
                width: 555,
                draggable: false,
                type: 'string',
                icon: IconPlus
            },
            {
                id: 'empty',
                title: '',
                width: 40,
                isAction: true,
                draggable: false,
                type: 'string'
            }
        ];
    }

    const columnsMap: ColumnsMap = {
        records: makeColumns(
            {
                id: '$createdAt',
                title: 'Created',
                type: 'datetime',
                width: { min: 180 },
                draggable: false,
                icon: IconCalendar
            },
            {
                id: '$updatedAt',
                title: 'Updated',
                type: 'datetime',
                width: { min: 180 },
                draggable: false,
                icon: IconCalendar
            }
        ),
        columns: makeColumns(
            {
                id: 'indexed',
                title: 'Indexed',
                type: 'boolean',
                width: { min: 180 },
                draggable: false,
                isAction: false
            },
            {
                id: 'default',
                title: 'Default',
                type: 'string',
                width: { min: 180 },
                draggable: false,
                isAction: false
            }
        ),
        indexes: makeColumns(
            {
                id: 'type',
                title: 'Type',
                type: 'string',
                width: { min: 150 },
                draggable: false,
                isAction: false
            },
            {
                id: 'attributes',
                title: 'Columns',
                type: 'string',
                width: { min: 200 },
                draggable: false,
                isAction: false
            }
        )
    };

    $: spreadsheetColumns = columnsMap[mode];
</script>

<div class="spreadsheet-container-outer">
    <Spreadsheet.Root
        allowSelection
        emptyCells={20}
        height="fit-content"
        columns={spreadsheetColumns}>
        <svelte:fragment slot="header" let:root>
            {#each spreadsheetColumns as column (column.id)}
                <Spreadsheet.Header.Cell {root} column={column.id} icon={column.icon ?? undefined}>
                    {#if column.isAction}
                        <Button.Button icon variant="extra-compact">
                            <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                        </Button.Button>
                    {:else}
                        {column.title}
                    {/if}
                </Spreadsheet.Header.Cell>
            {/each}
        </svelte:fragment>
    </Spreadsheet.Root>

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
                            on:click={actions?.primary?.onClick}>
                            <Icon icon={IconPlus} size="s" />
                            {actions?.primary?.text ?? `Create ${mode}`}
                        </Button.Button>

                        {#if mode === 'records'}
                            <Tooltip>
                                <Button.Button
                                    size="s"
                                    variant="secondary"
                                    disabled={actions?.random?.disabled}
                                    on:click={actions?.random?.onClick}
                                >
                                    {actions?.random?.text ?? `Generate random data`}
                                </Button.Button>
                                <span slot="tooltip">Yet to be added</span>
                            </Tooltip>
                        {/if}
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </div>
    </div>
</div>

<style lang="scss">
    .spreadsheet-container-outer {
        width: 100%;
        overflow: hidden;
        position: fixed;

        @media (max-width: 768px) {
            position: unset;
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
        height: 70vh;
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
            left: 55%; /* TODO: if both sidebars open, use 55%, else 50% */
            bottom: 40%;
        }
    }
</style>
