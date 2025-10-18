<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Activity } from '$lib/layout';
    import { pageToOffset } from '$lib/helpers/load';
    import { Skeleton } from '@appwrite.io/pink-svelte';
    import { type Models, Query } from '@appwrite.io/console';
    import { getTerminologies, type Record, toSupportiveRecord } from '$database/(entity)';

    const {
        record
    }: {
        record: Record;
    } = $props();

    let limit = 25; /* default */
    let offset = $state(0);
    let loading = $state(true);
    let recordActivityLogs = $state<Models.LogList | null>(null);

    const { terminology } = getTerminologies();

    onMount(loadRecordLogs);

    async function loadRecordLogs(event?: CustomEvent<number>) {
        loading = true;

        if (event) {
            offset = pageToOffset(event.detail, limit);
        }

        const { $databaseId: databaseId, entityId, $id: recordId } = toSupportiveRecord(record);

        if (terminology.type === 'documentsdb') {
            recordActivityLogs = await sdk
                .forProject(page.params.region, page.params.project)
                .documentsDB.listDocumentLogs({
                    databaseId: databaseId,
                    collectionId: entityId,
                    documentId: recordId,
                    queries: [Query.limit(limit), Query.offset(offset)]
                });
        } else {
            recordActivityLogs = await sdk
                .forProject(page.params.region, page.params.project)
                .tablesDB.listRowLogs({
                    databaseId: databaseId,
                    tableId: entityId,
                    rowId: $recordId,
                    queries: [Query.limit(limit), Query.offset(offset)]
                });
        }

        loading = false;
    }
</script>

{#if loading}
    <div style:margin-block="" style:margin-inline-end="2.25rem">
        <!--<Skeleton variant="line" height={25} width="25%" />-->
        <Skeleton variant="line" height={40} width="auto" />
    </div>
{:else if recordActivityLogs}
    <div class="record-activity-wrapper">
        <Activity
            {limit}
            {offset}
            insideSideSheet
            on:page={loadRecordLogs}
            logs={recordActivityLogs}
            useCreateLinkForPagination={false} />
    </div>
{/if}

<style lang="scss">
    .record-activity-wrapper {
        & :global(.console-container) {
            margin-inline: unset;
            padding-inline-end: unset;

            @media (max-width: 768px) {
                margin-block: 0.5rem;
            }
        }
    }
</style>
