<script lang="ts" module>
    export type DeleteOperationState = true | string | void;
</script>

<script lang="ts">
    import type { Snippet } from 'svelte';
    import {
        Table,
        Badge,
        Typography,
        FloatingActionBar,
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
        onDelete?: (selectedRows: string[]) => Promise<DeleteOperationState> | DeleteOperationState;
        onCancel?: () => Promise<void> | void;
    } = $props();

    let selectedRows: string[] = $state([]);
    let disableModal: boolean = $state(false);
    let onDeleteError: string | null = $state(null);
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
                        const state = await onDelete?.(selectedRows);
                        if (typeof state === 'string') {
                            // user should handle error on their own!
                        } else {
                            selectedRows = [];
                        }
                    }
                }}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

{#if allowSelection}
    <Confirm
        submissionLoader
        confirmDeletion
        error={onDeleteError}
        disabled={disableModal}
        title="Delete {resource}s"
        bind:open={showConfirmDeletion}
        onSubmit={async () => {
            disableModal = true;
            onDeleteError = null;

            const state = await onDelete?.(selectedRows);
            if (typeof state === 'string') {
                disableModal = false;
                onDeleteError = state || `Failed to delete ${resource}s`;
            } else {
                selectedRows = [];
                disableModal = false;
                showConfirmDeletion = false;
            }
        }}>
        <Typography.Text>
            Are you sure you want to delete <strong>{selectedRows.length}</strong>
            {selectedRows.length > 1 ? `${resource}s` : resource}.
        </Typography.Text>

        <Typography.Text variant="m-500">This action is irreversible.</Typography.Text>
    </Confirm>
{/if}
