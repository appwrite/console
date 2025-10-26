<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, MultiSelectionTable, type DeleteOperationState } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteTables } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Table } from '@appwrite.io/pink-svelte';
    import type { PageProps } from './$types';
    import { tableViewColumns } from './store';
    import { subNavigation } from '$lib/stores/database';
    import type { Models } from '@appwrite.io/console';

    let { data }: PageProps = $props();

    async function onDelete(selectedTables: string[]): Promise<DeleteOperationState> {
        const promises = selectedTables.map((tableId) =>
            sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({
                databaseId: page.params.database,
                tableId
            })
        );
        try {
            await Promise.all(promises);
            await invalidate(Dependencies.TABLES);
            subNavigation.update();

            trackEvent(Submit.TableDelete);
            addNotification({
                type: 'success',
                message: `${selectedTables.length} table${selectedTables.length > 1 ? 's' : ''} deleted`
            });

            return true;
        } catch (error) {
            trackError(error, Submit.TableDelete);
            return error.message;
        }
    }

    function getTableHref(table: Models.Table) {
        return resolve(
            '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
            {
                region: page.params.region,
                project: page.params.project,
                database: page.params.database,
                table: table.$id
            }
        );
    }
</script>

<MultiSelectionTable
    resource="table"
    confirmDeletion
    columns={$tableViewColumns}
    allowSelection={$canWriteTables}
    {onDelete}>
    {#snippet header(root)}
        {#each $tableViewColumns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each data.tables.tables as table (table.$id)}
            <Table.Row.Link {root} id={table.$id} href={getTableHref(table)}>
                {#each $tableViewColumns as column}
                    <Table.Cell column={column.id} {root}>
                        {#if column.id === '$id'}
                            {#key $tableViewColumns}
                                <Id value={table.$id}>{table.$id}</Id>
                            {/key}
                        {:else if column.id === 'name'}
                            {table.name}
                        {:else}
                            <DualTimeView time={table[column.id]} />
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Link>
        {/each}
    {/snippet}
</MultiSelectionTable>
