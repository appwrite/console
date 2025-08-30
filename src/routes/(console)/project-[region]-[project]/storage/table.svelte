<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Table, FloatingActionBar, Badge, Typography } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';
    import { canWriteBuckets } from '$lib/stores/roles';

    export let data: PageData;

    let selectedBuckets: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;
        deleting = true;

        const promises = selectedBuckets.map((bucketId) =>
            sdk.forProject(page.params.region, page.params.project).storage.deleteBucket(bucketId)
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.BucketDelete, {
                total: selectedBuckets.length
            });
            addNotification({
                type: 'success',
                message: `${selectedBuckets.length} bucket${selectedBuckets.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.BUCKET);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BucketDelete);
        } finally {
            selectedBuckets = [];
            showDelete = false;
            deleting = false;
        }
    }
</script>

<Table.Root
    columns={$columns}
    allowSelection={$canWriteBuckets}
    bind:selectedRows={selectedBuckets}
    let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.buckets.buckets as bucket (bucket.$id)}
        <Table.Row.Link
            {root}
            href={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${bucket.$id}`}
            id={bucket.$id}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Id value={bucket.$id}>
                                {bucket.$id}
                            </Id>
                        {/key}
                    {:else if column.id === 'name'}
                        {bucket.name}
                    {:else}
                        {toLocaleDateTime(bucket[column.id])}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>

{#if selectedBuckets.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedBuckets.length.toString()} />
            <span>
                {selectedBuckets.length > 1 ? 'buckets' : 'bucket'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedBuckets = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm title="Delete buckets" bind:open={showDelete} onSubmit={handleDelete} disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedBuckets.length}</b>
        {selectedBuckets.length > 1 ? 'buckets' : 'bucket'}?
    </Typography.Text>
    <Typography.Text>
        This action is irreversible and will permanently remove the selected buckets and all their
        files.
    </Typography.Text>
</Confirm>
