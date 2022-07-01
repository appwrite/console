<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Card, Empty, Pagination, Tile, Tiles } from '$lib/components';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@aw-labs/appwrite-console';
    import { goto } from '$app/navigation';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const databaseCreated = async (event: CustomEvent<Models.Database>) => {
        await goto(`${base}/console/${project}/databases/database/${event.detail.$id}`);
    };
    $: request = sdkForProject.databases.list(search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <h1>Databases</h1>
    <Card>
        <InputSearch bind:value={search} />
    </Card>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <p>{response.total} databases found</p>
            <Tiles>
                {#each response.databases as database}
                    <Tile
                        href={`${base}/console/${project}/databases/database/${database.$id}`}
                        title={database.name} />
                {/each}
            </Tiles>

            <Pagination {limit} bind:offset sum={response.total} />
        {:else if search}
            <Empty>
                <svelte:fragment slot="header">
                    No results found for <b>{search}</b>
                </svelte:fragment>
            </Empty>
        {:else}
            <Empty>
                <svelte:fragment slot="header">No Databases Found</svelte:fragment>
                You haven't created any database for your project yet.
            </Empty>
        {/if}
    {/await}

    <Button on:click={() => (showCreate = true)}>Create Database</Button>
</Container>

<Create bind:showCreate on:created={databaseCreated} />
