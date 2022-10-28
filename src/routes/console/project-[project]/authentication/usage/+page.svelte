<script lang="ts">
    import { Usage } from '$lib/layout';
    import { usersUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { UsagePeriods } from '$lib/layout/usage.svelte';

    let range: UsagePeriods = '30d';

    $: usersUsage.load(range);

    // TODO: metric type is wrong
    $: count = $usersUsage?.usersCount as unknown as Models.Metric[];
    $: created = $usersUsage?.usersCreate as unknown as Models.Metric[];
    $: read = $usersUsage?.usersRead as unknown as Models.Metric[];
    $: updated = $usersUsage?.usersUpdate as unknown as Models.Metric[];
    $: deleted = $usersUsage?.usersDelete as unknown as Models.Metric[];
</script>

<Usage
    title="Users"
    bind:range
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Users',
        title: 'Registered users'
    }}
    createdMetadata={{
        legend: 'Create',
        title: 'Users created'
    }}
    readMetadata={{
        legend: 'Read',
        title: 'Users read'
    }}
    updatedMetadata={{
        legend: 'Update',
        title: 'Users updated'
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: 'Users deleted'
    }} />
