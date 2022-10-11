<script lang="ts">
    import { Usage, type UsagePeriods } from '$lib/layout';
    import { databasesUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let range: UsagePeriods = '30d';

    $: databasesUsage.load(range);

    // TODO: metric type is wrong
    $: count = $databasesUsage?.databasesCount as unknown as Models.Metric[];
    $: created = $databasesUsage?.databasesCreate as unknown as Models.Metric[];
    $: read = $databasesUsage?.databasesRead as unknown as Models.Metric[];
    $: updated = $databasesUsage?.databasesUpdate as unknown as Models.Metric[];
    $: deleted = $databasesUsage?.databasesDelete as unknown as Models.Metric[];
</script>

<Usage
    title="Databases"
    bind:range
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Databases',
        title: 'Total databases'
    }}
    createdMetadata={{
        legend: 'Create',
        title: 'Databases created'
    }}
    readMetadata={{
        legend: 'Read',
        title: 'Databases read'
    }}
    updatedMetadata={{
        legend: 'Update',
        title: 'Databases updated'
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: 'Databases deleted'
    }} />
