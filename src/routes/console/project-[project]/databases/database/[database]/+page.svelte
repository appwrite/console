<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Copy, GridItem1, CardContainer } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { collections } from './store';
    import { cardLimit } from '$lib/stores/layout';

    let showCreate = false;
    let offset = 0;

    const project = $page.params.project;
    const databaseId = $page.params.database;
    const handleCreate = async (event: CustomEvent<Models.Collection>) => {
        showCreate = false;
        await goto(
            `${base}/console/project-${project}/databases/database/${databaseId}/collection/${event.detail.$id}`
        );
    };

    $: collections.load(databaseId, [Query.limit($cardLimit), Query.offset(offset)]);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Collections</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create collection</span>
        </Button>
    </div>

    {#if $collections?.total}
        <CardContainer total={$collections.total} {offset} on:click={() => (showCreate = true)}>
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
            <Pagination limit={$cardLimit} bind:offset sum={$collections.total} />
        </div>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <p>Create your first collection to get started</p>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
