<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Card, Empty, Pagination, Tile, Tiles } from '$lib/components';
    import type { Models } from 'src/sdk';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const bucketCreated = async (event: CustomEvent<Models.Bucket>) => {
        showCreate = false;
        await goto(`${base}/console/${project}/storage/bucket/${event.detail.$id}`);
    };

    $: request = sdkForProject.storage.listBuckets(search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <h1>Buckets</h1>
    <Card>
        <InputSearch bind:value={search} />
    </Card>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Tiles>
                {#each response.buckets as bucket}
                    <Tile
                        href={`${base}/console/${project}/storage/bucket/${bucket.$id}`}
                        title={bucket.name} />
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
                <svelte:fragment slot="header">No Buckets Found</svelte:fragment>
                You haven't created any buckets for your project yet.
            </Empty>
        {/if}
    {/await}

    <Button on:click={() => (showCreate = true)}>Create Bucket</Button>
</Container>

<Create bind:showCreate on:created={bucketCreated} />
