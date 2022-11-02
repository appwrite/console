<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: count = data.count;
    $: created = data.created;
    $: read = data.read;
    $: updated = data.updated;
    $: deleted = data.deleted;
</script>

<Usage
    title="Buckets"
    path={`/console/project-${$page.params.project}/storage/usage`}
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
