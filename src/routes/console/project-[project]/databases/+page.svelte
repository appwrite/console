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
    import { databaseList } from './store';
    import { cardLimit } from '$lib/stores/layout';
    import { createPersistentPagination } from '$lib/stores/pagination';

    let showCreate = false;
    let search = '';

    const project = $page.params.project;
    const offset = createPersistentPagination($cardLimit);

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/databases/database/${event.detail.$id}`);
    }

    $: databaseList.load(
        [Query.limit($cardLimit), Query.offset($offset), Query.orderDesc('$createdAt')],
        search
    );
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Databases</Heading>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create database</span>
        </Button>
    </div>

    {#if $databaseList?.total}
        <CardContainer
            total={$databaseList.total}
            offset={$offset}
            on:click={() => (showCreate = true)}>
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
            <svelte:fragment slot="empty">
                <p>Create a new database</p>
            </svelte:fragment>
        </CardContainer>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$databaseList.total}</p>
            <Pagination limit={$cardLimit} bind:offset={$offset} sum={$databaseList.total} />
        </div>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">Create your first Database to get started</p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-12">
                <Button external href="#/" text>Documentation</Button>
                <Button secondary>Create Database</Button>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
