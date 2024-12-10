<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, Modal } from '$lib/components';
    import FloatingActionBar from '$lib/components/floatingActionBar.svelte';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteCollections } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
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
            sdk
                .forProject($page.params.region, $page.params.project)
                .databases.deleteCollection(databaseId, collectionId)
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

<TableScroll>
    <TableHeader>
        {#if $canWriteCollections}
            <TableCellHeadCheck
                bind:selected
                pageItemsIds={data.collections.collections.map((c) => c.$id)} />
        {/if}
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.collections.collections as collection (collection.$id)}
            <TableRowLink
                href={`${base}/project-${$page.params.region}-${projectId}/databases/database-${databaseId}/collection-${collection.$id}`}>
                {#if $canWriteCollections}
                    <TableCellCheck bind:selectedIds={selected} id={collection.$id} />
                {/if}
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell title={column.title} width={column.width}>
                                    <Id value={collection.$id}>{collection.$id}</Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'name'}
                            <TableCellText title={column.title} width={column.width}>
                                {collection.name}
                            </TableCellText>
                        {:else}
                            <TableCellText title={column.title} width={column.width}>
                                {toLocaleDateTime(collection[column.id])}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selected.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selected.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selected.length > 1 ? 'collections' : 'collection'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selected = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete Collections"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selected.length}</b>
        {selected.length > 1 ? 'collections' : 'collection'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .actions {
        .indicator {
            border-radius: 0.25rem;
            background: hsl(var(--color-information-100));
            color: hsl(var(--color-neutral-0));

            padding: 0rem 0.375rem;
            display: inline-block;
        }
    }
</style>
