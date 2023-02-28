<script lang="ts">
    import { page } from '$app/stores';
    import { goto, invalidate } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Heading, ViewSelector } from '$lib/components';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { PageData } from './$types';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from '../create.svelte';
    import GridView from './gridView.svelte';
    import TableView from './tableView.svelte';
    import { preferredView } from '$lib/stores/layout';
    import { Dependencies } from '$lib/constants';

    export let data: PageData;
    let showCreate = false;

    const project = $page.params.project;
    const databaseId = $page.params.database;

    async function handleCreate(event: CustomEvent<Models.Collection>) {
        showCreate = false;
        await goto(
            `${base}/console/project-${project}/databases/database-${databaseId}/collection-${event.detail.$id}`
        );
    }

    $: preferredView.subscribe(() => {
        invalidate(Dependencies.DOCUMENT);
    });
</script>

<Container>
    <div class="u-flex common-section u-main-space-between">
        <Heading tag="h2" size="5">Collections</Heading>

        <div class="u-flex u-gap-16">
            <ViewSelector>test</ViewSelector>

            <Button on:click={() => (showCreate = true)} event="create_collection">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create collection</span>
            </Button>
        </div>
    </div>

    {#if data.collections.total}
        {#if $preferredView === 'list'}
            <TableView {data} />
        {:else}
            <GridView {data} bind:showCreate />
        {/if}
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases#collection"
            target="collection"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
