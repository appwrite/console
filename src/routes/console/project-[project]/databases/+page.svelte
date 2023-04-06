<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Container, GridHeader } from '$lib/layout';
    import { base } from '$app/paths';
    import Create from './create.svelte';
    import Grid from './grid.svelte';
    import Table from './table.svelte';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;

    let showCreate = false;
    const project = $page.params.project;

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/databases/database-${event.detail.$id}`);
    }
</script>

<Container>
    <GridHeader title="Databases" {columns} view={data.view}>
        <Button on:click={() => (showCreate = true)} event="create_database">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create database</span>
        </Button>
    </GridHeader>

    {#if data.databases.total}
        {#if data.view === 'grid'}
            <Grid {data} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Databases"
            limit={data.limit}
            offset={data.offset}
            total={data.databases.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases"
            target="database"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
