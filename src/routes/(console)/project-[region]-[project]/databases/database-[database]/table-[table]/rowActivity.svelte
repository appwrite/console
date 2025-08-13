<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Activity } from '$lib/layout';
    import { rowActivitySheet } from './store';
    import { pageToOffset } from '$lib/helpers/load';
    import { type Models, Query } from '@appwrite.io/console';
    import { Layout, Skeleton } from '@appwrite.io/pink-svelte';

    let limit = 25; /* default */
    let offset = $state(0);
    let loading = $state(true);
    let rowActivityLogs = $state<Models.LogList | null>(null);

    onMount(loadRowLogs);

    async function loadRowLogs(event?: CustomEvent<number>) {
        loading = true;

        if (event) {
            offset = pageToOffset(event.detail, limit);
        }

        const row = $rowActivitySheet.row;

        rowActivityLogs = await sdk
            .forProject(page.params.region, page.params.project)
            .grids.listRowLogs({
                databaseId: row.$databaseId,
                tableId: row.$tableId,
                rowId: row.$id,
                queries: [Query.limit(limit), Query.offset(offset)]
            });

        loading = false;
    }
</script>

{#if loading}
    <div style:margin-block="" style:margin-inline-end="2.25rem">
        <!--<Skeleton variant="line" height={25} width="25%" />-->
        <Skeleton variant="line" height={40} width="auto" />
    </div>
{:else if rowActivityLogs}
    <div class="row-activity-wrapper">
        <Activity
            {limit}
            {offset}
            on:page={loadRowLogs}
            logs={rowActivityLogs}
            databasesScreen
            useCreateLinkForPagination={false} />
    </div>
{/if}

<style lang="scss">
    .row-activity-wrapper :global(.console-container) {
        margin-inline: unset;
        padding-block-start: 1.25rem !important;
    }
</style>
