<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, Modal } from '$lib/components';
    import FloatingActionBar from '$lib/components/floatingActionBar.svelte';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteCollections } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Badge, Table } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;

    let selectedRows: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selectedRows.map((collectionId) =>
            sdk.forProject.databases.deleteCollection(databaseId, collectionId)
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
            href={`${base}/project-${projectId}/databases/database-${databaseId}/collection-${collection.$id}`}>
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

<FloatingActionBar show={selectedRows.length > 0}>
    <svelte:fragment slot="start">
        <Badge content={selectedRows.length.toString()} />
        <span>
            <span class="is-only-desktop">
                {selectedRows.length > 1 ? 'collections' : 'collection'}
            </span>
            selected
        </span>
    </svelte:fragment>
    <svelte:fragment slot="end">
        <Button text on:click={() => (selectedRows = [])}>Cancel</Button>
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</FloatingActionBar>

<Modal
    title="Delete Collections"
    bind:show={showDelete}
    onSubmit={handleDelete}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selectedRows.length}</b>
        {selectedRows.length > 1 ? 'collections' : 'collection'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
