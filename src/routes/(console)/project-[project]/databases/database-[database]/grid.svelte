<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { canWriteCollections } from '$lib/stores/roles';
    import type { PageData } from './$types';
    export let data: PageData;
    export let showCreate = false;
    const projectId = page.params.project;
    const databaseId = page.params.database;
</script>

<CardContainer
    disableEmpty={!$canWriteCollections}
    total={data.collections.total}
    on:click={() => (showCreate = true)}
    event="table">
    {#each data.collections.collections as collection}
        <GridItem1
            href={`${base}/project-${projectId}/databases/database-${databaseId}/table-${collection.$id}`}>
            <svelte:fragment slot="title">{collection.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !collection.enabled}
                    <Pill>disabled</Pill>
                {/if}</svelte:fragment>

            <Id value={collection.$id}>{collection.$id}</Id>
        </GridItem1>
    {/each}
</CardContainer>
