<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteTables } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Badge, FloatingActionBar, Table, Typography } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { tableViewColumns, buildEntityRoute } from './store';
    import Confirm from '$lib/components/confirm.svelte';
    import { subNavigation } from '$lib/stores/database';
    import { type TerminologyResult } from '$database/(entity)';

    const {
        data,
        terminology
    }: {
        data: PageData;
        terminology: TerminologyResult;
    } = $props();

    let deleting = $state(false);
    let showDelete = $state(false);
    let selectedTables: string[] = $state([]);

    const entityPlural = terminology.entity.lower.plural;
    const entitySingular = terminology.entity.lower.singular;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedTables.map((tableId) =>
            sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({
                databaseId: page.params.database,
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
            await invalidate(Dependencies.TABLES);
            subNavigation.update();
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
</Table.Root>

{#if selectedTables.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedTables.length.toString()} />
            <span>
                {selectedTables.length > 1 ? entityPlural : entitySingular}
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
        {selectedTables.length > 1 ? entityPlural : entitySingular}?
    </Typography.Text>
</Confirm>
