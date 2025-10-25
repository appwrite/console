<script lang="ts">
    import type { Snippet } from 'svelte';
    import {
        Table,
        FloatingActionBar,
        Badge,
        type TableColumn,
        type TableRootProps
    } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { Confirm } from '$lib/components/index';

    let {
        columns,
        resource,
        allowSelection = true,
        confirmDeletion = false,
        header,
        children,
        onDelete,
        onCancel
    }: {
        resource: string;
        allowSelection?: boolean;
        confirmDeletion?: boolean;
        columns: Array<TableColumn> | number;
        header: Snippet<[root: TableRootProps]>;
        children: Snippet<[root: TableRootProps]>;
        onDelete?: (selectedRows: string[]) => Promise<void> | void;
        onCancel?: () => Promise<void> | void;
    } = $props();

    let selectedRows: string[] = $state([]);
    let showConfirmDeletion: boolean = $state(false);
</script>

<Table.Root let:root {columns} {allowSelection} bind:selectedRows>
    <svelte:fragment slot="header" let:root>
        {@render header?.(root)}
    </svelte:fragment>

    {@render children(root)}
</Table.Root>

{#if allowSelection && selectedRows.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedRows.length.toString()} />
            <span>
                {selectedRows.length > 1 ? `${resource}s` : resource}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button
                text
                on:click={() => {
                    onCancel?.();
                    selectedRows = [];
                }}>Cancel</Button>
            <Button
                secondary
                on:click={async () => {
                    if (confirmDeletion) {
                        showConfirmDeletion = true;
                    } else {
                        await onDelete?.(selectedRows);
                    }
                }}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    confirmDeletion
    title="Delete {resource}s"
    bind:open={showConfirmDeletion}
    onSubmit={async () => {
        await onDelete?.(selectedRows);
        showConfirmDeletion = false;
    }}
>
    <p>
        Are you sure you want to delete <strong>{selectedRows.length}</strong>
        {selectedRows.length > 1 ? `${resource}s` : resource}
    </p>

    <p class="u-bold">This action is irreversible.</p>
</Confirm>
