<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { table } from '../store';
    import type { Columns } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isRelationship } from '../rows/store';
    import Confirm from '$lib/components/confirm.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';

    let {
        showDelete = $bindable(false),
        selectedColumn = $bindable(null)
    }: {
        showDelete: boolean;
        selectedColumn: Columns | string[];
    } = $props();

    let error = $state<string | null>(null);

    const selectedColumns = $derived(
        Array.isArray(selectedColumn) ? selectedColumn : [selectedColumn]
    );

    const selectedKeys = $derived(
        selectedColumns.map((c: string | Columns) => (typeof c === 'string' ? c : c.key))
    );

    const requiresTwoWayConfirm = $derived(
        selectedColumns
            .filter((c): c is Columns => typeof c !== 'string')
            .some((col) => isRelationship(col) && col.twoWay)
    );

    async function handleDelete() {
        try {
            const client = sdk.forProject(page.params.region, page.params.project);

            await Promise.all(
                selectedKeys.map((key) =>
                    client.tablesDB.deleteColumn({
                        databaseId: page.params.database,
                        tableId: page.params.table,
                        key
                    })
                )
            );

            trackEvent(Submit.ColumnDelete);
            addNotification({
                type: 'success',
                message:
                    selectedColumns.length === 1
                        ? 'Column has been deleted'
                        : `${selectedColumns.length} columns have been deleted`
            });

            await invalidate(Dependencies.TABLE);
            showDelete = false;
            selectedColumn = [];
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ColumnDelete);
        }
    }

    function getAsRelationship(column: string | Columns): Models.ColumnRelationship {
        return column as Models.ColumnRelationship;
    }

    const relatedColumn = $derived(
        requiresTwoWayConfirm ? getAsRelationship(selectedColumns[0]) : undefined
    );

    const confirmDeletionLabel = $derived(
        !requiresTwoWayConfirm
            ? 'I understand and confirm'
            : `Delete relationship between ${relatedColumn.key} to ${relatedColumn.twoWayKey}`
    );
</script>

<Confirm
    bind:open={showDelete}
    onSubmit={handleDelete}
    title="Delete column"
    bind:error
    confirmDeletion
    {confirmDeletionLabel}>
    {#if selectedColumns.length === 1}
        <p>
            Are you sure you want to delete <b data-private>{selectedKeys[0]}</b> from
            <b data-private>{$table?.name}</b>?
        </p>
    {:else}
        <p>
            Are you sure you want to delete <b data-private>{selectedKeys.join(', ')}</b> from
            <b data-private>{$table?.name}</b>?
        </p>
    {/if}

    {#if requiresTwoWayConfirm}
        <!-- not allowed on multi selections, safe to assume that this isn't a string! -->
        <Layout.Stack direction="column" gap="xl">
            <p>
                This is a two way relationship and the corresponding relationship will also be
                deleted.
            </p>
            <p><b>This action is irreversible.</b></p>
        </Layout.Stack>
    {/if}
</Confirm>
