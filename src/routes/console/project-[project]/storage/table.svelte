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
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll,
        TableCellCheck
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;
    const projectId = $page.params.project;

    let selected: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selected.map((bucketId) => sdk.forProject.storage.deleteBucket(bucketId));
        try {
            await Promise.all(promises);
            trackEvent(Submit.BucketDelete);
            addNotification({
                type: 'success',
                message: `${selected.length} bucket${selected.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.BUCKET);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BucketDelete);
        } finally {
            selected = [];
            showDelete = false;
        }
    }
</script>

<TableScroll>
    <TableHeader>
        <TableCellHeadCheck bind:selected pageItemsIds={data.buckets.buckets.map((c) => c.$id)} />
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.buckets.buckets as bucket}
            <TableRowLink
                href={`${base}/console/project-${projectId}/storage/bucket-${bucket.$id}`}>
                <TableCellCheck bind:selectedIds={selected} id={bucket.$id} />
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell width={column.width} title={column.title}>
                                    <Id value={bucket.$id}>
                                        {bucket.$id}
                                    </Id>
                                </TableCell>
                            {/key}
                        {:else}
                            <TableCellText width={column.width} title={column.title}>
                                {#if column.transform}
                                    {column.transform(bucket[column.id])}
                                {:else}
                                    {bucket[column.id]}
                                {/if}
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
                    {selected.length > 1 ? 'buckets' : 'bucket'}
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
    title="Delete Bucket"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selected.length}</b>
        {selected.length > 1 ? 'buckets' : 'bucket'}?
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
