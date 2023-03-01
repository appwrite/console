<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, Copy, GridItem1, Pagination } from '$lib/components';
    import { CARD_LIMIT } from '$lib/constants';
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
                <Pill button><span class="icon-duplicate" />Database ID</Pill>
            </Copy>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p class="text">Create a new database</p>
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
