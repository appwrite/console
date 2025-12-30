<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, MultiSelectionTable, type DeleteOperationState } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { canWriteTables } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { Table } from '@appwrite.io/pink-svelte';
    import { tableViewColumns, buildEntityRoute } from './store';
    import { subNavigation } from '$lib/stores/database';
    import { type TerminologyResult } from '$database/(entity)';

    const {
        data,
        terminology
    }: {
        data: PageData;
        terminology: TerminologyResult;
    } = $props();

    const entitySingular = terminology.entity.lower.singular;

    async function onDelete(selectedTables: string[]): Promise<DeleteOperationState> {
        const promises = selectedTables.map((tableId) =>
            sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({
                databaseId: page.params.database,
                tableId
            })
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.TableDelete);
        } catch (error) {
            trackError(error, Submit.TableDelete);
            return error;
        } finally {
            await invalidate(Dependencies.TABLES);
            subNavigation.update();
        }
    }
</script>

<MultiSelectionTable
    resource={entitySingular}
    columns={$tableViewColumns}
    allowSelection={$canWriteTables}
    {onDelete}>
    {#snippet header(root)}
        {#each $tableViewColumns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    {/snippet}

    {#snippet children(root)}
        {#each data.entities.entities as entity (entity.$id)}
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
