<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, Copy, CustomPagination, GridItem1 } from '$lib/components';
    import { CARD_LIMIT, Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { createPersistentPagination } from '$lib/stores/pagination';
    import type { PageData } from './$types';

    export let data: PageData;
    export let showCreate = false;

    const databaseId = $page.params.database;
    const project = $page.params.project;
    const offset = createPersistentPagination(CARD_LIMIT);
</script>

<CardContainer
    event="collection"
    total={data.collections.total}
    offset={$offset}
    on:click={() => (showCreate = true)}>
    {#each data.collections.collections as collection}
        <GridItem1
            href={`${base}/console/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}>
            <svelte:fragment slot="title">{collection.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !collection.enabled}
                    <Pill>disabled</Pill>
                {/if}</svelte:fragment>

            <Copy value={collection.$id}>
                <Pill button><span class="icon-duplicate" />Collection ID</Pill>
            </Copy>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a new collection</p>
    </svelte:fragment>
</CardContainer>

<CustomPagination
    limit={CARD_LIMIT}
    name="Collections"
    path={`/console/project-${$page.params.project}/databases/database-${$page.params.database}`}
    offset={data.offset}
    total={data.collections.total}
    dependencies={[Dependencies.DATABASE]} />
