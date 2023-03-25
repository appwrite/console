<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, Copy, GridItem1 } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { PageData } from './$types';
    export let data: PageData;
    export let showCreate = false;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;
</script>

<CardContainer
    total={data.collections.total}
    on:click={() => (showCreate = true)}
    event="collection">
    {#each data.collections.collections as collection}
        <GridItem1
            href={`${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${collection.$id}`}>
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
</CardContainer>
