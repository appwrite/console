<script lang="ts">
    import { Empty, PaginationWithLimit, SearchQuery, ViewSelector } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { columns, showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { canWriteCollections } from '$lib/stores/roles';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { consoleProfile } from '$lib/system';

    export let data: PageData;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by ID or name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector
                {columns}
                view={data.view}
                hideColumns={!data.collections.total}
                hideView={!data.collections.total} />
            {#if $canWriteCollections}
                <Button on:click={() => ($showCreate = true)} event="create_collection">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create collection
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

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
            description={consoleProfile.hasChat
                ? 'Collections let you group and manage structured documents.'
                : 'Need a hand? Learn more in our documentation.'}
            href="https://appwrite.io/docs/products/databases/collections"
            target="collection"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>
