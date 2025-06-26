<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { canWriteCollections } from '$lib/stores/roles';
    import type { PageData } from './$types';
    import { Badge } from '@appwrite.io/pink-svelte';
    export let data: PageData;
    export let showCreate = false;
    const projectId = page.params.project;
    const databaseId = page.params.database;
</script>

<CardContainer
    disableEmpty={!$canWriteCollections}
    total={data.tables.total}
    on:click={() => (showCreate = true)}
    event="table">
    {#each data.tables.tables as table}
        <GridItem1
            href={`${base}/project-${page.params.region}-${projectId}/databases/database-${databaseId}/table-${table.$id}`}>
            <svelte:fragment slot="title">{table.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !table.enabled}
                    <Badge variant="secondary" content="disabled" />
                {/if}</svelte:fragment>

            <Id value={table.$id}>{table.$id}</Id>
        </GridItem1>
    {/each}
</CardContainer>
