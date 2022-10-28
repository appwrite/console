<script lang="ts">
    import { Usage, type UsagePeriods } from '$lib/layout';
    import { storageUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let range: UsagePeriods = '30d';

    $: storageUsage.load(range);

    // TODO: metric type is wrong
    $: count = $storageUsage?.bucketsCount as unknown as Models.Metric[];
    $: created = $storageUsage?.bucketsCreate as unknown as Models.Metric[];
    $: read = $storageUsage?.bucketsRead as unknown as Models.Metric[];
    $: updated = $storageUsage?.bucketsUpdate as unknown as Models.Metric[];
    $: deleted = $storageUsage?.bucketsDelete as unknown as Models.Metric[];
</script>

<Usage
    title="Buckets"
    bind:range
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Buckets',
        title: 'Total buckets'
    }}
    createdMetadata={{
        legend: 'Create',
        title: 'Buckets created'
    }}
    readMetadata={{
        legend: 'Read',
        title: 'Buckets read'
    }}
    updatedMetadata={{
        legend: 'Update',
        title: 'Buckets updated'
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: 'Buckets deleted'
    }} />
