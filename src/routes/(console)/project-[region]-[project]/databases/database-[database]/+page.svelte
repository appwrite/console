<script lang="ts">
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { columns, showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { canWriteCollections } from '$lib/stores/roles';
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let data: PageData;
</script>

<Container>
    <ResponsiveContainerHeader
        bind:view={data.view}
        {columns}
        hasSearch
        searchPlaceholder="Search by name or ID">
        <Tooltip disabled={$canWriteCollections}>
            <Button
                on:click={() => ($showCreate = true)}
                event="create_collection"
                disabled={!$canWriteCollections}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create collection
            </Button>
            <div slot="tooltip">Your role does not allow this action</div>
        </Tooltip>
    </ResponsiveContainerHeader>

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
