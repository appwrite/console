<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Heading, ViewSelector } from '$lib/components';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import Create from '../create.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import GridView from './gridView.svelte';
    import TableView from './tableView.svelte';
    import { prefs } from '$lib/stores/user';

    export let data: PageData;
    const project = $page.params.project;

    let showCreate = false;
    let columns = [
        { id: '$id', name: 'Database ID', show: true, width: 50 },
        { id: 'name', name: 'Name', show: true, width: 120 },
        { id: '$createdAt', name: 'Created', show: true, width: 120 },
        { id: '$updatedAt', name: 'Updated', show: true, width: 120 }
    ];

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/databases/database-${event.detail.$id}`);
    }
</script>

<Container>
    <div class="u-flex common-section u-main-space-between">
        <Heading tag="h2" size="5">Databases</Heading>

        <div class="u-flex u-gap-16">
            <ViewSelector bind:columns />

            <Button on:click={() => (showCreate = true)} event="create_database">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create database</span>
            </Button>
        </div>
    </div>

    {#if data.databases.total}
        {#if $prefs?.preferredView === 'list'}
            <TableView {data} {columns} />
        {:else}
            <GridView {data} bind:showCreate />
        {/if}
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases"
            target="database"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
