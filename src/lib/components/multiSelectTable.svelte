<script lang="ts" module>
    export type DeleteOperationState = {
        error?: Error;
        deleted: string[];
    } | void;

    export type DeleteOperation = (
        deleteFn: (id: string) => Promise<unknown>,
        batchSize?: number
    ) => Promise<Exclude<DeleteOperationState, void>>;
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
    import Confirm from './confirm.svelte';
    import { Button } from '$lib/elements/forms';
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
        onDelete?: (
            batchDelete: DeleteOperation,
            /**
             * this is useful when you have a custom deletion logic
             * and the default `batchDelete` helper doesn't fit the use-case!
             */
            selectedRows: string[]
        ) => Promise<DeleteOperationState> | DeleteOperationState;
        onCancel?: () => Promise<void> | void;
    } = $props();

    let selectedRows: string[] = $state([]);
    let disableModal: boolean = $state(false);
    let onDeleteError: string | null = $state(null);
    let showConfirmDeletion: boolean = $state(false);

    function notifySuccess(count: number) {
        if (!showSuccessNotification) return;
        if (count === 0) return;

        const label = `${resource}${count > 1 ? 's' : ''}`;

        addNotification({
            type: 'success',
            message: `${count} ${label} deleted`
        });
    }

    // this is kept very basic!
    function getPluralResource() {
        if (resource.endsWith('ty')) {
            return `${resource}ies`;
        }

        return `${resource}s`;
    }

    async function batchDelete(
        ids: string[],
        deleteFn: (id: string) => Promise<unknown>,
        batchSize: number | undefined = undefined
    ): Promise<Exclude<DeleteOperationState, void>> {
        const deleted: string[] = [];
        let firstError: Error | undefined;

        // prevent infinite loop
        if (batchSize !== undefined) {
            batchSize = Math.max(1, Math.floor(Math.abs(batchSize)));
        }

        async function processBatch(batch: string[]) {
            // build promises
            const results = await Promise.allSettled(batch.map((id) => deleteFn(id)));

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    // success, log it!
                    deleted.push(batch[index]);
                } else if (!firstError) {
                    // error
                    firstError =
                        result.reason instanceof Error
                            ? result.reason
                            : new Error(String(result.reason));
                }
            });
        }

        // batch when needed.
        // example: >= 100 items to delete!
        if (batchSize && batchSize < ids.length) {
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize);
                await processBatch(batch);
            }
        } else {
            await processBatch(ids);
        }

        return {
            deleted,
            error: firstError
        };
    }

    async function consumeDeleteOperation() {
        const state = await onDelete?.((deleteFn, batchSize) => {
            return batchDelete(selectedRows, deleteFn, batchSize);
        }, selectedRows);

        if (!state) {
            return false;
        }

        const deletedCount = state.deleted.length;
        selectedRows = selectedRows.filter((id) => !state.deleted.includes(id));

        if (state.error) {
            onDeleteError = `Some ${getPluralResource()} were not deleted. Error: ${state.error.message}`;
            return false;
        }

        notifySuccess(deletedCount);
        return true;
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
                            await consumeDeleteOperation();
                        }
                    }}>Delete</Button>
            </svelte:fragment>
        </FloatingActionBar>
    {/if}

    {#if allowSelection && confirmDeletion}
        <Confirm
            submissionLoader
            confirmDeletion
            error={onDeleteError}
            disabled={disableModal}
            title="Delete {getPluralResource()}"
            bind:open={showConfirmDeletion}
            onSubmit={async () => {
                disableModal = true;
                onDeleteError = null;

                const allDeleted = await consumeDeleteOperation();

                if (allDeleted) {
                    showConfirmDeletion = false;
                }

                disableModal = false;
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
