<script lang="ts">
    import { page } from '$app/stores';
    import { Usage, type UsagePeriods } from '$lib/layout';
    import { collectionUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let range: UsagePeriods = '30d';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    $: collectionUsage.load(databaseId, collectionId, range);

    // TODO: metric type is wrong
    $: count = $collectionUsage?.documentsCount as unknown as Models.Metric[];
    $: created = $collectionUsage?.documentsCreate as unknown as Models.Metric[];
    $: read = $collectionUsage?.documentsRead as unknown as Models.Metric[];
    $: updated = $collectionUsage?.documentsUpdate as unknown as Models.Metric[];
    $: deleted = $collectionUsage?.documentsDelete as unknown as Models.Metric[];
</script>

<Usage
    bind:range
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Documents',
        title: 'Total documents'
    }}
    createdMetadata={{
        legend: 'Create',
        title: 'Documents created'
    }}
    readMetadata={{
        legend: 'Read',
        title: 'Documents read'
    }}
    updatedMetadata={{
        legend: 'Update',
        title: 'Documents updated'
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: 'Documents deleted'
    }} />
