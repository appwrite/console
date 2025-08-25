<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteTables } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Badge, FloatingActionBar, Table, Typography } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { tableViewColumns } from './store';
    import Confirm from '$lib/components/confirm.svelte';

    export let data: PageData;
    const databaseId = page.params.database;

    let deleting = false;
    let showDelete = false;
    let selectedTables: string[] = [];

    async function handleDelete() {
        showDelete = false;

        const promises = selectedTables.map((tableId) =>
            sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({
                databaseId,
                tableId
            })
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.TableDelete);
            addNotification({
                type: 'success',
                message: `${selectedTables.length} table${selectedTables.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.TABLES);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.TableDelete);
        } finally {
            selectedTables = [];
            showDelete = false;
        }
    }
</script>

<Table.Root
    columns={$tableViewColumns}
    allowSelection={$canWriteTables}
    bind:selectedRows={selectedTables}
    let:root>
    <svelte:fragment slot="header" let:root>
        {#each $tableViewColumns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.tables.tables as table (table.$id)}
        <Table.Row.Link
            {root}
            id={table.$id}
            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${table.$id}`}>
            {#each $tableViewColumns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $tableViewColumns}
                            <Id value={table.$id}>{table.$id}</Id>
                        {/key}
                    {:else if column.id === 'name'}
                        {table.name}
                    {:else}
                        {toLocaleDateTime(table[column.id])}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>

{#if selectedTables.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedTables.length.toString()} />
            <span>
                {selectedTables.length > 1 ? 'tables' : 'table'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedTables = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm title="Delete tables" bind:open={showDelete} onSubmit={handleDelete} disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedTables.length}</b>
        {selectedTables.length > 1 ? 'tables' : 'table'}?
    </Typography.Text>
</Confirm>
