<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, Copy, GridItem1 } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { PageData } from './$types';
    export let data: PageData;
    export let showCreate = false;
    const project = $page.params.project;
</script>

<CardContainer total={data.databases.total} on:click={() => (showCreate = true)} event="database">
    {#each data.databases.databases as database}
        <GridItem1 href={`${base}/console/project-${project}/databases/database-${database.$id}`}>
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
