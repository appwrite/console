<script lang="ts">
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { tableViewColumns, showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { canWriteCollections } from '$lib/stores/roles';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let data: PageData;
</script>

<Container>
    <ResponsiveContainerHeader
        bind:view={data.view}
        columns={tableViewColumns}
        hasSearch
        searchPlaceholder="Search by name or ID">
        {#if $canWriteCollections}
            <Button on:click={() => ($showCreate = true)} event="create_table">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create table
            </Button>
        {/if}
    </ResponsiveContainerHeader>

    {#if data.tables.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreate} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Tables"
            limit={data.limit}
            offset={data.offset}
            total={data.tables.total} />
    {:else}
        <Empty
            single
            allowCreate={$canWriteCollections}
            href="https://appwrite.io/docs/products/databases/tables"
            target="table"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>
