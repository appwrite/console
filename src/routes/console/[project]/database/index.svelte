<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Tile, Tiles } from '$lib/components';
    import Create from './_create.svelte';
    import { goto } from '$app/navigation';
    import type { Models } from 'src/sdk';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const collectionCreated = async (event: CustomEvent<Models.Collection>) => {
        await goto(`${base}/console/${project}/database/collection/${event.detail.$id}`);
    };

    $: request = sdkForProject.database.listCollections(search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Collections</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create Collection</span>
        </Button>
    </div>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Tiles>
                {#each response.collections as collection}
                    <Tile
                        href={`${base}/console/${project}/database/collection/${collection.$id}`}
                        title={collection.name} />
                {/each}
            </Tiles>
            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
            </div>
        {:else if search}
            <Empty>
                No results found for <b>{search}</b>
            </Empty>
        {:else}
            <Empty>You haven't created any collections for your project yet.</Empty>
        {/if}
    {/await}
</Container>
<Create bind:showCreate on:created={collectionCreated} />
