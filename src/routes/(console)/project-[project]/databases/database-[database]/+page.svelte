<script lang="ts">
    import { Empty, PaginationWithLimit, SearchQuery, ViewSelector, EmptySearch } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ContainerHeader } from '$lib/layout';
    import { columns, showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { canWriteCollections } from '$lib/stores/roles';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let data: PageData;
</script>

<Container>
    <ContainerHeader title="Collections" serviceId="databases" isFlex={false}>
        <SearchQuery search={data.search} placeholder="Search by collection name">
            <div class="u-flex u-gap-16 header-right">
                <div class="header-view-div">
                    <ViewSelector
                        view={data.view}
                        {columns}
                        hideView={!data.collections.total}
                        hideColumns={!data.collections.total} />
                </div>
                {#if $canWriteCollections}
                    <Button on:click={() => ($showCreate = true)} event="create_collection">
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create collection</span>
                    </Button>
                {/if}
            </div>
        </SearchQuery>
    </ContainerHeader>

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
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no collections that match your search.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button
                    external
                    href="https://appwrite.io/docs/products/databases/collections"
                    text>
                    Documentation
                </Button>
                <Button
                    secondary
                    href={`${base}/project-${$page.params.project}/databases/database-${$page.params.database}`}>
                    Clear Search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={$canWriteCollections}
            href="https://appwrite.io/docs/products/databases/collections"
            target="collection"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>

<style>
    @media (max-width: 480px) {
        .header-right {
            flex-direction: column-reverse;
        }
    }
    .header-view-div {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
    }
</style>
