<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Copy, GridItem1 } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { databaseList } from './store';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const limit = 6;
    const project = $page.params.project;
    const handleCreate = async (event: CustomEvent<Models.Database>) => {
        showCreate = false;
        await goto(`${base}/console/project-${project}/databases/database/${event.detail.$id}`);
    };

    $: databaseList.load(search, limit, offset ?? 0);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Databases</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create database</span>
        </Button>
    </div>

    {#if $databaseList?.total}
        <div
            class="grid-box common-section"
            style={` --grid-item-size:${$databaseList.total > 3 ? '22rem' : '25rem'};`}>
            {#each $databaseList.databases as database}
                <GridItem1
                    href={`${base}/console/project-${project}/databases/database/${database.$id}`}>
                    <svelte:fragment slot="eyebrow">X Collections</svelte:fragment>
                    <svelte:fragment slot="title">{database.name}</svelte:fragment>

                    <Copy value={database.$id}>
                        <Pill button><i class="icon-duplicate" />Database ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            {#if ($databaseList.total % 2 !== 0 || $databaseList.total % 4 === 0) && $databaseList.total - offset <= limit}
                <Empty isButton on:click={() => (showCreate = true)}>
                    <p>Create a new database</p>
                </Empty>
            {/if}
        </div>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$databaseList.total}</p>
            <Pagination {limit} bind:offset sum={$databaseList.total} />
        </div>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <p>Create your first Database to get started</p>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
