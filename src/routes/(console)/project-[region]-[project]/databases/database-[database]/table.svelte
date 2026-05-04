<script lang="ts">
    import { invalidate } from '$app/navigation';
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
    import { Table } from '@appwrite.io/pink-svelte';
    import { tableViewColumns, buildEntityRoute } from './store';
    import { subNavigation } from '$lib/stores/database';
    import {
        type DatabaseSdkResult,
        type EntityList,
        type TerminologyResult
    } from '$database/(entity)';

    const {
        entities,
        terminology,
        databaseSdk
    }: {
        entities: EntityList;
        terminology: TerminologyResult;
        databaseSdk: DatabaseSdkResult;
    } = $props();

    const entitySingular = $derived(terminology.entity.lower.singular);
    async function onDelete(batchDelete: DeleteOperation): Promise<DeleteOperationState> {
        const result = await batchDelete((entityId) =>
            databaseSdk.deleteEntity({
                databaseId: page.params.database,
                entityId
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
</script>

<MultiSelectionTable
    resource={entitySingular}
    columns={$tableViewColumns}
    allowSelection={$canWriteTables}
    {onDelete}>
    {#snippet header(root)}
        {#each $tableViewColumns as { id, title } (id)}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each entities.entities as entity (entity.$id)}
            <Table.Row.Link
                {root}
                id={entity.$id}
                href={buildEntityRoute(page, entitySingular, entity.$id)}>
                {#each $tableViewColumns as column}
                    <Table.Cell column={column.id} {root}>
                        {#if column.id === '$id'}
                            {#key $tableViewColumns}
                                <Id value={entity.$id}>{entity.$id}</Id>
                            {/key}
                        {:else if column.id === 'name'}
                            {entity.name}
                        {:else}
                            <DualTimeView time={entity[column.id]} />
                        {/if}
                    </Table.Cell>
                {/each}
            </Table.Row.Link>
        {/each}
    {/snippet}
</MultiSelectionTable>
