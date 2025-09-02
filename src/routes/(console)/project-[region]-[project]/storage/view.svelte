<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Empty, PaginationWithLimit, SearchQuery, Id, CardContainer, GridItem1 } from '$lib/components';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { columns } from './store';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Icon, Layout, Table as PinkTable, Badge, Tooltip } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import Create from './create.svelte';
    import type { Models } from '@appwrite.io/console';
    import { showCreateBucket } from './+page.svelte';

    let {
        buckets,
        limit,
        offset,
        view,
        search,
        createBucketUrl
    }: {
        buckets: { total: number; buckets: Models.Bucket[] };
        limit: number;
        offset: number;
        view: 'grid' | 'table';
        search: string | null;
        createBucketUrl: (bucket: Models.Bucket) => string;
    } = $props();

    const clearSearchHref = page.url.pathname;

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        showCreateBucket.set(false);
        await goto(createBucketUrl(event.detail));
    }
</script>

<Layout.Stack direction="row" justifyContent="space-between">
    <Layout.Stack direction="row" alignItems="center">
        <SearchQuery placeholder="Search by name or ID" />
    </Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <ViewSelector {columns} {view} hideColumns={!buckets.total} hideView={!buckets.total} />
        {#if $canWriteBuckets}
            <Button on:click={() => ( $showCreateBucket = true )} event="create_bucket" size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create bucket
            </Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>

{#if buckets.total}
    {#if view === 'grid'}
        <CardContainer disableEmpty={!$canWriteBuckets} total={buckets.total} {offset} event="bucket" service="buckets" on:click={() => ($showCreateBucket = true)}>
            {#each buckets.buckets as bucket}
                <GridItem1 href={createBucketUrl(bucket)}>
                    <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if !bucket.enabled}
                            <div>
                                <Badge size="s" variant="secondary" content="Disabled" />
                            </div>
                        {/if}
                    </svelte:fragment>
                    <Id value={bucket.$id}>{bucket.$id}</Id>
                    <svelte:fragment slot="icons">
                        <Tooltip>
                            <span class:u-opacity-20={!bucket.encryption} class="icon-lock-closed" aria-hidden="true"></span>
                            <span slot="tooltip">{bucket.encryption ? 'Encryption enabled' : 'Encryption disabled'}</span>
                        </Tooltip>
                    </svelte:fragment>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty"><p>Create a bucket</p></svelte:fragment>
        </CardContainer>
    {:else}
        <PinkTable.Root columns={$columns} let:root>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title }}
                    <PinkTable.Header.Cell column={id} {root}>{title}</PinkTable.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each buckets.buckets as bucket (bucket.$id)}
                <PinkTable.Row.Link {root} href={createBucketUrl(bucket)}>
                    {#each $columns as column}
                        <PinkTable.Cell column={column.id} {root}>
                            {#if column.id === '$id'}
                                {#key $columns}
                                    <Id value={bucket.$id}>{bucket.$id}</Id>
                                {/key}
                            {:else if column.id === 'name'}
                                {bucket.name}
                            {:else}
                                {toLocaleDateTime(bucket[column.id])}
                            {/if}
                        </PinkTable.Cell>
                    {/each}
                </PinkTable.Row.Link>
            {/each}
        </PinkTable.Root>
    {/if}

    <PaginationWithLimit name="Buckets" {limit} {offset} total={buckets.total} />
{:else}
    <Empty single href="https://appwrite.io/docs/products/storage" target="bucket" on:click={() => showCreateBucket.set(true)} />
{/if}

<Create bind:showCreate={$showCreateBucket} on:created={bucketCreated} />
