<script lang="ts" module>
    export type HeaderCellAction =
        | 'update'
        | 'column-left'
        | 'column-right'
        | 'duplicate-header'
        | 'create-index'
        | 'sort-asc'
        | 'sort-desc'
        | 'delete';

    export type RowCellAction =
        | 'update'
        | 'duplicate-row'
        | 'permissions'
        | 'activity'
        | 'copy-json'
        // | 'copy-snippet'
        | 'delete';
</script>

<script lang="ts">
    import type { ComponentType, Snippet } from 'svelte';
    import { Divider, Popover, ActionMenu } from '@appwrite.io/pink-svelte';
    import {
        IconArrowLeft,
        IconArrowRight,
        IconChartBar,
        IconClipboardCopy,
        IconDuplicate,
        IconKey,
        IconPencil,
        IconSortAscending,
        IconSortDescending,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { type Columns, databaseColumnSheetOptions } from './store';

    interface MenuItem {
        label?: string;
        action?: HeaderCellAction | RowCellAction;
        danger?: boolean;
        divider?: boolean;
        icon?: ComponentType;
    }

    // Only allow sort for these columns
    const internalColumns = ['$id', '$createdAt', '$updatedAt'];

    const headerMenuItems: MenuItem[] = [
        { label: 'Update', icon: IconPencil, action: 'update' },
        { label: 'Insert column left', icon: IconArrowLeft, action: 'column-left' },
        { label: 'Insert column right', icon: IconArrowRight, action: 'column-right' },
        { label: 'Duplicate', icon: IconDuplicate, action: 'duplicate-header' },
        { divider: true },
        { label: 'Create index', icon: IconPencil, action: 'create-index' },
        { label: 'Sort ascending', icon: IconSortAscending, action: 'sort-asc' },
        { label: 'Sort descending', icon: IconSortDescending, action: 'sort-desc' },
        { divider: true },
        { label: 'Delete', icon: IconTrash, action: 'delete', danger: true }
    ];

    const rowMenuItems: MenuItem[] = [
        { label: 'Update', icon: IconPencil, action: 'update' },
        { label: 'Duplicate', icon: IconDuplicate, action: 'duplicate-row' },
        { divider: true },
        { label: 'Manage permissions', icon: IconKey, action: 'permissions' },
        { label: 'View activity', icon: IconChartBar, action: 'activity' },
        { divider: true },
        { label: 'Copy as JSON', icon: IconClipboardCopy, action: 'copy-json' },
        { divider: true },
        { label: 'Delete', icon: IconTrash, action: 'delete', danger: true }
    ];

    let {
        column,
        columnId = null,
        children,
        onSelect,
        type
    }: {
        column: Columns;
        columnId?: string;
        type: 'header' | 'row';
        onSelect: (option: HeaderCellAction | RowCellAction, columnId: string) => void;
        children: Snippet<[toggle: (event: Event) => void]>;
    } = $props();

    function handleSelect(action: HeaderCellAction | RowCellAction, hide: () => void) {
        hide();
        $databaseColumnSheetOptions.column = column;

        if (action === 'column-left') {
            $databaseColumnSheetOptions.direction = {
                neighbour: columnId,
                to: 'left'
            };
        } else if (action === 'column-right') {
            $databaseColumnSheetOptions.direction = {
                neighbour: columnId,
                to: 'right'
            };
        }

        onSelect(action, columnId);
    }

    function shouldShow(item: MenuItem): boolean {
        const isSystemColumn = internalColumns.includes(columnId);

        if (type === 'header') {
            if (['delete', 'update', 'duplicate-header'].includes(item.action) && isSystemColumn) {
                return false;
            }
        }

        return true;
    }

    function cleanMenu(items: MenuItem[]): MenuItem[] {
        const visible = items.filter((item) => item.divider || shouldShow(item));

        return visible.filter((item, i, arr) => {
            const prev = arr[i - 1];
            const next = arr[i + 1];

            if (item.divider) {
                return prev && !prev.divider && next && !next.divider;
            }

            return true;
        });
    }
</script>

<Popover let:toggle padding="none" placement="bottom-start" portal>
    {@render children(toggle)}

    <svelte:fragment slot="tooltip" let:hide>
        {@const menuItems = cleanMenu(type === 'header' ? headerMenuItems : rowMenuItems)}

        <ActionMenu.Root width="180px">
            {#each menuItems as item, index (index)}
                {#if item.divider}
                    <div style:padding-block="0.25rem">
                        <Divider />
                    </div>
                {:else if shouldShow(item)}
                    <ActionMenu.Item.Button
                        leadingIcon={item.icon}
                        status={item.danger ? 'danger' : undefined}
                        on:click={() => item.action && handleSelect(item.action, hide)}>
                        {item.label}
                    </ActionMenu.Item.Button>
                {/if}
            {/each}
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>
