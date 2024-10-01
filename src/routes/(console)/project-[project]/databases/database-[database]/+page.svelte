<script lang="ts">
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, GridHeader } from '$lib/layout';
    import { columns, showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { canWriteCollections } from '$lib/stores/roles';

    export let data: PageData;
</script>

<Container>
    <GridHeader
        title="Collections"
        {columns}
        view={data.view}
        hideColumns={!data.collections.total}
        hideView={!data.collections.total}>
        {#if $canWriteCollections}
            <Button on:click={() => ($showCreate = true)} event="create_collection">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create collection</span>
            </Button>
        {/if}
    </GridHeader>

    {#if data.collections.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreate} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Collections"
            limit={data.limit}
            offset={data.offset}
            total={data.collections.total} />
    {:else}
        <Empty
            single
            allowCreate={$canWriteCollections}
            href="https://appwrite.io/docs/products/databases/collections"
            target="collection"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>
