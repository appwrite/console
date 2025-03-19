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
    import { Badge, Selector, Table } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;

    let selected: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selected.map((collectionId) =>
            sdk.forProject.databases.deleteCollection(databaseId, collectionId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.CollectionDelete);
            addNotification({
                type: 'success',
                message: `${selected.length} collection${selected.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.COLLECTIONS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.CollectionDelete);
        } finally {
            selected = [];
            showDelete = false;
        }
    }
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#if $canWriteCollections}
            <Table.Header.Selector width="20px" />
        {/if}
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width + 'px'}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each data.collections.collections as collection (collection.$id)}
        <Table.Link
            href={`${base}/project-${projectId}/databases/database-${databaseId}/collection-${collection.$id}`}>
            {#if $canWriteCollections}
                <Table.Cell>
                    <Selector.Checkbox size="s" />
                </Table.Cell>
            {/if}

            {#each $columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Table.Cell>
                                <Id value={collection.$id}>{collection.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'name'}
                        <Table.Cell>
                            {collection.name}
                        </Table.Cell>
                    {:else}
                        <Table.Cell>
                            {toLocaleDateTime(collection[column.id])}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Link>
    {/each}
</Table.Root>

<FloatingActionBar show={selected.length > 0}>
    <svelte:fragment slot="start">
        <Badge content={selected.length.toString()} />
        <span>
            <span class="is-only-desktop">
                {selected.length > 1 ? 'collections' : 'collection'}
            </span>
            selected
        </span>
    </svelte:fragment>
    <svelte:fragment slot="end">
        <Button text on:click={() => (selected = [])}>Cancel</Button>
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</FloatingActionBar>

<Modal
    title="Delete Collections"
    bind:show={showDelete}
    onSubmit={handleDelete}
    dismissible={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selected.length}</b>
        {selected.length > 1 ? 'collections' : 'collection'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>
