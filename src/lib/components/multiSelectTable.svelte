<script lang="ts" module>
    // TODO: @itznotabug - true | string | Error | void
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
    import { addNotification } from '$lib/stores/notifications';

    let {
        columns,
        resource,
        allowSelection = true,
        confirmDeletion = true,
        showSuccessNotification = true,
        computeKey = 'multiSelectionTable',
        header,
        children,
        onDelete,
        onCancel,
        deleteContent,
        deleteContentNotice
    }: {
        resource: string;
        allowSelection?: boolean;
        confirmDeletion?: boolean;
        computeKey?: string | number;
        showSuccessNotification?: boolean;
        columns: Array<TableColumn> | number;
        header: Snippet<[root: TableRootProps]>;
        children: Snippet<[root: TableRootProps]>;
        deleteContent?: Snippet<[count: number]>;
        deleteContentNotice?: Snippet;
        onDelete?: (selectedRows: string[]) => Promise<DeleteOperationState> | DeleteOperationState;
        onCancel?: () => Promise<void> | void;
    } = $props();

    let selectedRows: string[] = $state([]);
    let disableModal: boolean = $state(false);
    let onDeleteError: string | null = $state(null);
    let showConfirmDeletion: boolean = $state(false);

    function notifySuccess() {
        if (!showSuccessNotification) return;

        const count = selectedRows.length;
        if (count === 0) return;

        const label = `${resource}${count > 1 ? 's' : ''}`;

        addNotification({
            type: 'success',
            message: `${count} ${label} deleted`
        });
    }

    // this is kept very basic!
    function getPluralResource() {
        if (resource.endsWith('y')) {
            return `${resource}ies`;
        }

        return `${resource}s`;
    }
</script>

{#key computeKey}
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
                    {selectedRows.length > 1 ? getPluralResource() : resource}
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
                                notifySuccess();
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
                    notifySuccess();
                    selectedRows = [];
                    disableModal = false;
                    showConfirmDeletion = false;
                }
            }}>
            <Typography.Text>
                {@const selectionCount = selectedRows.length}
                {#if deleteContent}
                    <!-- some show extra info -->
                    {@render deleteContent(selectionCount)}
                {:else}
                    Are you sure you want to delete <strong>{selectionCount}</strong>
                    {selectionCount > 1 ? getPluralResource() : resource}?
                {/if}
            </Typography.Text>

            <Typography.Text variant="m-500">
                {#if deleteContentNotice}
                    <!-- some show extra info -->
                    {@render deleteContentNotice()}
                {:else}
                    This action is irreversible.
                {/if}
            </Typography.Text>
        </Confirm>
    {/if}
{/key}
