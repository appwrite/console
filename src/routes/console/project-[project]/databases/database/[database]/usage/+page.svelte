<script lang="ts">
    import { page } from '$app/stores';
    import { Usage, type UsagePeriods } from '$lib/layout';
    import { databaseUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let range: UsagePeriods = '30d';

    const databaseId = $page.params.database;

    $: databaseUsage.load(databaseId, range);

    // TODO: metric type is wrong
    $: count = $databaseUsage?.collectionsCount as unknown as Models.Metric[];
    $: created = $databaseUsage?.collectionsCreate as unknown as Models.Metric[];
    $: read = $databaseUsage?.collectionsRead as unknown as Models.Metric[];
    $: updated = $databaseUsage?.collectionsUpdate as unknown as Models.Metric[];
    $: deleted = $databaseUsage?.collectionsDelete as unknown as Models.Metric[];
</script>

<Usage
    bind:range
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Collections',
        title: 'Total collections'
    }}
    createdMetadata={{
        legend: 'Create',
        title: 'Collections created'
    }}
    readMetadata={{
        legend: 'Read',
        title: 'Collections read'
    }}
    updatedMetadata={{
        legend: 'Update',
        title: 'Collections updated'
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: 'Collections deleted'
    }} />
