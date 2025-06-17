<script lang="ts">
    import { page } from '$app/state';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { canWriteCollections } from '$lib/stores/roles';
    import type { PageData } from './$types';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;
    export let showCreate = false;

    const databaseId = page.params.database;
</script>

<CardContainer
    disableEmpty={!$canWriteCollections}
    total={data.collections.total}
    on:click={() => (showCreate = true)}
    event="collection">
    {#each data.collections.collections as collection}
        <GridItem1
            href={getProjectRoute(
                `/databases/database-${databaseId}/collection-${collection.$id}`
            )}>
            <svelte:fragment slot="title">{collection.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !collection.enabled}
                    <Pill>disabled</Pill>
                {/if}</svelte:fragment>

            <Id value={collection.$id}>{collection.$id}</Id>
        </GridItem1>
    {/each}
</CardContainer>
