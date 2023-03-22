<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, Copy, Empty, GridItem1, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { cardLimit } from '$lib/stores/layout';
    import { createPersistentPagination } from '$lib/stores/pagination';
    import { showCreate } from './store';
    import type { PageData } from './$types';

    export let data: PageData;

    const project = $page.params.project;
    const databaseId = $page.params.database;
    const offset = createPersistentPagination($cardLimit);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Collections</Heading>

        <Button on:click={() => ($showCreate = true)} event="create_collection">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create collection</span>
        </Button>
    </div>

    {#if data.collections.total}
        <CardContainer
            event="collection"
            total={data.collections.total}
            offset={$offset}
            on:click={() => ($showCreate = true)}>
            {#each data.collections.collections as collection}
                <GridItem1
                    href={`${base}/console/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}>
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
            <p class="text">Total results: {data.collections.total}</p>
            <Pagination limit={data.limit} offset={data.offset} sum={data.collections.total} />
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases#collection"
            target="collection"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>
