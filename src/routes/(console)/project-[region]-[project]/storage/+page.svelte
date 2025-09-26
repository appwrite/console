<script lang="ts" context="module">
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { Empty, EmptySearch, PaginationWithLimit } from '$lib/components';
    import Create from './create.svelte';
    import { Container } from '$lib/layout';
    import ResponsiveContainerHeader from '$lib/layout/responsiveContainerHeader.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { columns } from './store';
    import Grid from './grid.svelte';
    import Table from './table.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { clearSearchInput } from '$lib/helpers/clearSearch';

    export let data;

    const project = page.params.project;
    let searchQuery: { clearInput: () => void } | undefined;
    const clearSearch = () => clearSearchInput(searchQuery);

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        showCreateBucket.set(false);
        await goto(
            `${base}/project-${page.params.region}-${project}/storage/bucket-${event.detail.$id}`
        );
    }
</script>

<Container>
    <ResponsiveContainerHeader
        hasSearch
        {columns}
        bind:view={data.view}
        searchPlaceholder="Search by name or ID"
        bind:searchQuery>
        {#if $canWriteBuckets}
            <Button on:click={() => ($showCreateBucket = true)} event="create_bucket" size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create bucket
            </Button>
        {/if}
    </ResponsiveContainerHeader>
    {#if data.buckets.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreateBucket} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Databases"
            limit={data.limit}
            offset={data.offset}
            total={data.buckets.total} />
    {:else if data.search}
        <EmptySearch target="buckets" hidePagination>
            <Button secondary on:click={clearSearch}>Clear search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/storage"
            target="bucket"
            on:click={() => showCreateBucket.set(true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateBucket} on:created={bucketCreated} />
