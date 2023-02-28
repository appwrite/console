<script lang="ts">
    import { page } from '$app/stores';
    import { goto, invalidate } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Heading, ViewSelector } from '$lib/components';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import Create from '../create.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import GridView from './gridView.svelte';
    import TableView from './tableView.svelte';
    import { preferredView } from '$lib/stores/layout';
    import { Dependencies } from '$lib/constants';

    export let data: PageData;

    let showCreate = false;
    const project = $page.params.project;

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/databases/database-${event.detail.$id}`);
    }

    $: preferredView.subscribe(() => {
        invalidate(Dependencies.COLLECTION);
    });
</script>

<Container>
    <div class="u-flex common-section u-main-space-between">
        <Heading tag="h2" size="5">Databases</Heading>

        <div class="u-flex u-gap-16">
            <ViewSelector>test</ViewSelector>

            <Button on:click={() => (showCreate = true)} event="create_database">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create database</span>
            </Button>
        </div>
    </div>

    {#if data.databases.total}
        {#if $preferredView === 'list'}
            <TableView {data} />
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
