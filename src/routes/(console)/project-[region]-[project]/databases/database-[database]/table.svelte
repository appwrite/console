<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        Id,
        MultiSelectionTable,
        type DeleteOperation,
        type DeleteOperationState
    } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { canWriteTables } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Table } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { tableViewColumns } from './store';
    import { subNavigation } from '$lib/stores/database';
    import type { Models } from '@appwrite.io/console';

    const {
        data
    }: {
        data: PageData;
    } = $props();

    async function onDelete(batchDelete: DeleteOperation): Promise<DeleteOperationState> {
        const result = await batchDelete((tableId) =>
            sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({
                databaseId: page.params.database,
                tableId
            })
        );

        try {
            if (result.error) {
                trackError(result.error, Submit.TableDelete);
            } else {
                trackEvent(Submit.TableDelete, { total: result.deleted.length });
            }
        } finally {
            await invalidate(Dependencies.TABLES);
            subNavigation.update();
        }

        return result;
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
    columns={$tableViewColumns}
    allowSelection={$canWriteTables}
    {onDelete}>
    {#snippet header(root)}
        {#each $tableViewColumns as { id, title } (id)}
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
