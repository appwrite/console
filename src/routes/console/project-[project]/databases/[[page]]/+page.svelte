<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Copy, GridItem1, CardContainer, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import Create from '../_create.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';

    export let data: PageData;

    let showCreate = false;
    const project = $page.params.project;

    async function handleCreate(event: CustomEvent<Models.Database>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/databases/database-${event.detail.$id}`);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Databases</Heading>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create database</span>
        </Button>
    </div>

    {#if data.databases.total}
        <CardContainer total={data.databases.total} on:click={() => (showCreate = true)}>
            {#each data.databases.databases as database}
                <GridItem1
                    href={`${base}/console/project-${project}/databases/database-${database.$id}`}>
                    <!-- <svelte:fragment slot="eyebrow">X Collections</svelte:fragment> -->
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
            <p class="text">Total results: {data.databases.total}</p>
            <Pagination
                limit={CARD_LIMIT}
                path={`/console/project-${$page.params.project}/databases`}
                offset={data.offset}
                sum={data.databases.total} />
        </div>
    {:else}
        <Empty single on:click={() => (showCreate = true)}>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">Create your first database to get started</p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-12">
                <Button external href="https://appwrite.io/docs/databases" text>
                    Documentation
                </Button>
                <Button secondary on:click={() => (showCreate = true)}>Create database</Button>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
