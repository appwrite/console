<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteCollections } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Badge, FloatingActionBar, Table, Typography } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { columns } from './store';
    import Confirm from '$lib/components/confirm.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;
    const databaseId = page.params.database;

    let selectedRows: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedRows.map((collectionId) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .databases.deleteCollection(databaseId, collectionId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.CollectionDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} collection${selectedRows.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.COLLECTIONS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.CollectionDelete);
        } finally {
            selectedRows = [];
            showDelete = false;
        }
    }
</script>

<Table.Root columns={$columns} allowSelection={$canWriteCollections} bind:selectedRows let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.collections.collections as collection (collection.$id)}
        <Table.Row.Link
            {root}
            id={collection.$id}
            href={getProjectRoute(
                `/databases/database-${databaseId}/collection-${collection.$id}`
            )}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Id value={collection.$id}>{collection.$id}</Id>
                        {/key}
                    {:else if column.id === 'name'}
                        {collection.name}
                    {:else}
                        {toLocaleDateTime(collection[column.id])}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>

{#if selectedRows.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedRows.length.toString()} />
            <span>
                {selectedRows.length > 1 ? 'collections' : 'collection'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedRows = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    title="Delete collections"
    bind:open={showDelete}
    onSubmit={handleDelete}
    disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedRows.length}</b>
        {selectedRows.length > 1 ? 'collections' : 'collection'}?
    </Typography.Text>
</Confirm>
