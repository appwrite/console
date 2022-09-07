<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, EmptyGridItem, Pagination, Copy, GridItem1 } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { collections } from './store';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const limit = 6;
    const project = $page.params.project;
    const databaseId = $page.params.database;
    const handleCreate = async (event: CustomEvent<Models.Collection>) => {
        showCreate = false;
        await goto(
            `${base}/console/project-${project}/databases/database/${databaseId}/collection/${event.detail.$id}`
        );
    };

    $: collections.load(search, limit, offset ?? 0);
    $: if (search) offset = 0;
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
        <div
            class="grid-box common-section"
            style={` --grid-item-size:${$collections.total > 3 ? '22rem' : '25rem'};`}>
            {#each $collections.collections as collection}
                <GridItem1
                    href={`${base}/console/project-${project}/databases/database/${databaseId}/collection/${collection.$id}`}>
                    <svelte:fragment slot="eyebrow">
                        {#await collections.total(collection.$id)}
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
            {#if ($collections.total % 2 !== 0 || $collections.total % 4 === 0) && $collections.total - offset <= limit}
                <EmptyGridItem on:click={() => (showCreate = true)}>
                    <div class="common-section">
                        <Button secondary round>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Create a new collection</p>
                    </div>
                </EmptyGridItem>
            {/if}
        </div>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$collections.total}</p>
            <Pagination {limit} bind:offset sum={$collections.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no collections that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$collections?.total}</p>
            <Pagination {limit} bind:offset sum={$collections?.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <i class="icon-plus" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Create your first collection to get started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
