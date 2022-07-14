<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Copy, Bucket } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { databaseList } from './store';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const limit = 5;
    const project = $page.params.project;
    const databaseCreated = async (event: CustomEvent<Models.Database>) => {
        showCreate = false;
        await goto(`${base}/console/${project}/databases/database/${event.detail.$id}`);
    };

    $: databaseList.load(search, limit, offset ?? 0);
    $: if (search) offset = 0;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Databases</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create database</span>
        </Button>
    </div>

    {#if $databaseList?.total}
        <div class="grid-box common-section" style="--grid-gap:2rem; --grid-item-size:25rem;">
            {#each $databaseList.databases as database}
                <Bucket href={`${base}/console/${project}/databases/database/${database.$id}`}>
                    <svelte:fragment slot="eyebrow">XX Collections</svelte:fragment>
                    <svelte:fragment slot="title">{database.name}</svelte:fragment>

                    <Copy value={database.$id}>
                        <Pill button><i class="icon-duplicate" />Database ID</Pill>
                    </Copy>
                </Bucket>
            {/each}
            {#if $databaseList.total % 2 !== 0}
                <article class="card is-border-dashed">
                    <div class="bucket">
                        <div class="u-flex u-flex-vertical u-cross-center">
                            <div class="common-section">
                                <Button secondary round on:click={() => (showCreate = true)}>
                                    <i class="icon-plus" />
                                </Button>
                            </div>
                            <div class="common-section">
                                <p>Create a new database</p>
                            </div>
                        </div>
                    </div>
                </article>
            {/if}
        </div>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$databaseList.total}</p>
            <Pagination {limit} bind:offset sum={$databaseList.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no databases that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$databaseList?.total}</p>
            <Pagination {limit} bind:offset sum={$databaseList?.total} />
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
                    <p>Create your first Database to get started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={databaseCreated} />
