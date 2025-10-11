<script lang="ts">
    import { page } from '$app/state';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { canWriteTables } from '$lib/stores/roles';
    import type { PageData } from './$types';
    import { Badge } from '@appwrite.io/pink-svelte';
    import type { TerminologyResult } from '$database/(entity)';
    import { buildEntityRoute } from '$database/store';
    import { onMount } from 'svelte';

    let {
        data,
        showCreate = $bindable(false),
        terminology
    }: {
        data: PageData;
        showCreate: boolean;
        terminology: TerminologyResult;
    } = $props();

    onMount(() => {
        /* silences `declared but its value is never read` warning. */
        showCreate;
    });
</script>

<CardContainer
    disableEmpty={!$canWriteTables}
    total={data.entities.total}
    on:click={() => (showCreate = true)}
    event={terminology.entity.lower.singular}>
    {#each data.entities.entities as table}
        <GridItem1 href={buildEntityRoute(page, terminology.entity.lower.singular, table.$id)}>
            <svelte:fragment slot="title">{table.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !table.enabled}
                    <Badge variant="secondary" content="disabled" />
                {/if}</svelte:fragment>

            <Id value={table.$id}>{table.$id}</Id>
        </GridItem1>
    {/each}
</CardContainer>
