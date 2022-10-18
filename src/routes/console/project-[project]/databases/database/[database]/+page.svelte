<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Copy, GridItem1, CardContainer, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { collections } from './store';
    import { cardLimit } from '$lib/stores/layout';
    import { createPersistentPagination } from '$lib/stores/pagination';

    let showCreate = false;

    const project = $page.params.project;
    const databaseId = $page.params.database;
    const offset = createPersistentPagination($cardLimit);

    async function handleCreate(event: CustomEvent<Models.Collection>) {
        showCreate = false;
        await goto(
            `${base}/console/project-${project}/databases/database/${databaseId}/collection/${event.detail.$id}`
        );
    }

    $: collections.load(databaseId, [
        Query.limit($cardLimit),
        Query.offset($offset),
        Query.orderDesc('$createdAt')
    ]);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Collections</Heading>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create collection</span>
        </Button>
    </div>

    {#if $collections?.total}
        <CardContainer
            total={$collections.total}
            offset={$offset}
            on:click={() => (showCreate = true)}>
            {#each $collections.collections as collection}
                <GridItem1
                    href={`${base}/console/project-${project}/databases/database/${databaseId}/collection/${collection.$id}`}>
                    <svelte:fragment slot="eyebrow">
                        {#await collections.total(databaseId, collection.$id)}
                            N Documents
                        {:then n}
                            {n[collection.$id] ? n[collection.$id] : 'NO'} Documents
                        {/await}</svelte:fragment>
                    <svelte:fragment slot="title">{collection.name}</svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if !collection.enabled}
                            <Pill>disabled</Pill>
                        {/if}</svelte:fragment>

                    <Copy value={collection.$id}>
                        <Pill button><i class="icon-duplicate" />Collection ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new collection</p>
            </svelte:fragment>
        </CardContainer>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$collections.total}</p>
            <Pagination limit={$cardLimit} bind:offset={$offset} sum={$collections.total} />
        </div>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">Create your first collection to get started</p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-12 ">
                <Button external href="#/" text>Documentation</Button>
                <Button secondary>Create Collection</Button>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
