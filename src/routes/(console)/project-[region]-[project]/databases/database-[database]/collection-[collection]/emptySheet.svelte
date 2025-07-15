<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import {
        Button,
        Icon,
        Layout,
        Spreadsheet,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconCalendar, IconFingerPrint, IconPlus } from '@appwrite.io/pink-icons-svelte';

    const staticColumns = [
        {
            id: '$id',
            title: 'ID',
            width: 200,
            draggable: false,
            type: 'string',
            icon: IconFingerPrint
        },
        {
            id: '$createdAt',
            title: 'createdAt',
            width: { min: 180 },
            draggable: false,
            type: 'datetime',
            icon: IconCalendar
        },
        {
            id: '$updatedAt',
            title: 'updatedAt',
            width: { min: 180 },
            draggable: false,
            type: 'datetime',
            icon: IconCalendar
        },
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

    const dispatch = createEventDispatcher();
</script>

<div class="spreadsheet-container-outer">
    <Spreadsheet.Root allowSelection emptyCells={20} height="fit-content" columns={staticColumns}>
        <svelte:fragment slot="header" let:root>
            {#each staticColumns as column (column.id)}
                {#if column.isAction}
                    <Spreadsheet.Header.Cell column="actions" {root}>
                        <Button.Button icon variant="extra-compact" on:click={() => {}}>
                            <Icon icon={IconPlus} color="--fgcolor-neutral-primary" />
                        </Button.Button>
                    </Spreadsheet.Header.Cell>
                {:else}
                    <Spreadsheet.Header.Cell
                        {root}
                        column={column.id}
                        icon={column.icon ?? undefined}>
                        {column.title}
                    </Spreadsheet.Header.Cell>
                {/if}
            {/each}
        </svelte:fragment>
    </Spreadsheet.Root>

    <div class="spreadsheet-fade-bottom">
        <div class="empty-actions">
            <Layout.Stack gap="xl">
                <Typography.Title>You have no records yet</Typography.Title>

                <Layout.Stack>
                    <Button.Button
                        icon
                        size="s"
                        variant="secondary"
                        on:click={() => dispatch('record')}>
                        <Icon icon={IconPlus} size="s" />
                        Create record
                    </Button.Button>

                    <Tooltip>
                        <Button.Button
                            size="s"
                            variant="secondary"
                            on:click={() => dispatch('random')}>
                            Generate random data
                        </Button.Button>

                        <span slot="tooltip"> Yet to be added </span>
                    </Tooltip>
                </Layout.Stack>
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
            left: 55%;
            bottom: 40%;
        }
    }
</style>
