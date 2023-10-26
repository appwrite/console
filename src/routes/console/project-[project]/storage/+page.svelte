<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, GridHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';

    import Create from './create.svelte';
    import Grid from './grid.svelte';
    import { columns } from './store';
    import Table from './table.svelte';

    export let data: PageData;

    let showCreate = false;
    const project = $page.params.project;

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/storage/bucket-${event.detail.$id}`);
    }
</script>

<Container>
    <GridHeader
        title="Buckets"
        view={data.view}
        {columns}
        hideColumns={!data.buckets.total}
        hideView={!data.buckets.total}>
        <Button on:click={() => (showCreate = true)} event="create_bucket">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create bucket</span>
        </Button>
    </GridHeader>

    {#if data.buckets.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate />
        {:else}
            <Table {data} />
        {/if}
        <PaginationWithLimit
            name="Buckets"
            limit={data.limit}
            offset={data.offset}
            total={data.buckets.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/storage"
            target="bucket"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={bucketCreated} />
