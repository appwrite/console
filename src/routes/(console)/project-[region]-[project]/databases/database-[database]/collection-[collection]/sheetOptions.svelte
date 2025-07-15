<script lang="ts" module>
    export type Action =
        | 'update'
        | 'column-left'
        | 'column-right'
        | 'duplicate-row'
        | 'create-index'
        | 'sort-asc'
        | 'sort-desc'
        | 'delete';
</script>

<script lang="ts">
    import type { ComponentType, Snippet } from 'svelte';
    import { Divider, Popover, ActionMenu } from '@appwrite.io/pink-svelte';
    import {
        IconArrowLeft,
        IconArrowRight,
        IconDuplicate,
        IconPencil,
        IconSortAscending,
        IconSortDescending,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { type Attributes, databaseSheetOptions } from './store';

    interface MenuItem {
        label?: string;
        action?: Action;
        danger?: boolean;
        divider?: boolean;
        icon?: ComponentType;
    }

    // Only allow sort for these columns
    const internalColumns = ['$id', '$createdAt', '$updatedAt'];

    const menuItems: MenuItem[] = [
        { label: 'Update', icon: IconPencil, action: 'update' },
        { label: 'Insert column left', icon: IconArrowLeft, action: 'column-left' },
        { label: 'Insert column right', icon: IconArrowRight, action: 'column-right' },
        { label: 'Duplicate', icon: IconDuplicate, action: 'duplicate-row' },
        { divider: true },
        { label: 'Create index', icon: IconPencil, action: 'create-index' },
        { label: 'Sort ascending', icon: IconSortAscending, action: 'sort-asc' },
        { label: 'Sort descending', icon: IconSortDescending, action: 'sort-desc' },
        { divider: true },
        { label: 'Delete', icon: IconTrash, action: 'delete', danger: true }
    ];

    let {
        column,
        children,
        onSelect
    }: {
        column: Attributes;
        onSelect: (option: Action) => void;
        children: Snippet<[toggle: (event: Event) => void]>;
    } = $props();

    function handleSelect(action: Action, hide: () => void) {
        hide();
        onSelect(action);
        $databaseSheetOptions.column = column;
    }

    function shouldShow(item: MenuItem) {
        if (item.action === 'sort-asc' || item.action === 'sort-desc') {
            return internalColumns.includes(column?.key);
        }
        return true;
    }
</script>

<Popover let:toggle padding="none" placement="bottom">
    {@render children(toggle)}

    <svelte:fragment slot="tooltip" let:hide>
        <ActionMenu.Root width="180px" noPadding>
            {#each menuItems as item, index (index)}
                {#if item.divider}
                    <Divider />
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
