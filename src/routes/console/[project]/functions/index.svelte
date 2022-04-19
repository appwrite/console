<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Card, Empty, Pagination, Tile, Tiles, ElementCount } from '$lib/components';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;

    $: request = sdkForProject.functions.list(search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <h1>Functions</h1>
    <Card>
        <InputSearch bind:value={search} />
    </Card>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <ElementCount count={response.total}>functions</ElementCount>
            <Tiles>
                {#each response.functions as func}
                    <Tile
                        href={`${base}/console/${project}/functions/function/${func.$id}`}
                        title={func.name} />
                {/each}
            </Tiles>

            <Pagination {limit} bind:offset sum={response.total} />
        {:else if search}
            <Empty>
                <svelte:fragment slot="header"
                    >No results found for <b>{search}</b></svelte:fragment>
            </Empty>
        {:else}
            <Empty>
                <svelte:fragment slot="header">No Functions Found</svelte:fragment>
                You haven't created any functions for your project yet.
            </Empty>
        {/if}
    {/await}

    <Button on:click={() => (showCreate = true)}>Create Function</Button>
</Container>

<Create bind:showCreate />
