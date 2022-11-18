<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Copy, GridItem1, CardContainer, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import Create from '../create.svelte';
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

        <Button on:click={() => (showCreate = true)} event="create_database">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create database</span>
        </Button>
    </div>

    {#if data.databases.total}
        <CardContainer
            total={data.databases.total}
            on:click={() => (showCreate = true)}
            event="database">
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
        <Empty
            single
            href="https://appwrite.io/docs/databases"
            target="database"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
