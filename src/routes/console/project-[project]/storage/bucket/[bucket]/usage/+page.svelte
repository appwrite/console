<script lang="ts">
    import { page } from '$app/stores';
    import { Usage, type UsagePeriods } from '$lib/layout';
    import { bucketUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let range: UsagePeriods = '30d';

    const bucketId = $page.params.bucket;

    $: bucketUsage.load(bucketId, range);

    // TODO: metric type is wrong
    $: count = $bucketUsage?.filesCount as unknown as Models.Metric[];
    $: created = $bucketUsage?.filesCreate as unknown as Models.Metric[];
    $: read = $bucketUsage?.filesRead as unknown as Models.Metric[];
    $: updated = $bucketUsage?.filesUpdate as unknown as Models.Metric[];
    $: deleted = $bucketUsage?.filesDelete as unknown as Models.Metric[];
</script>

<Usage
    bind:range
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Files',
        title: 'Total files'
    }}
    createdMetadata={{
        legend: 'Create',
        title: 'Files created'
    }}
    readMetadata={{
        legend: 'Read',
        title: 'Files read'
    }}
    updatedMetadata={{
        legend: 'Update',
        title: 'Files updated'
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: 'Files deleted'
    }} />
