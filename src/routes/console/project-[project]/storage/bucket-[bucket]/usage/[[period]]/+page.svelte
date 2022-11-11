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
    title="Files"
    path={`/console/project-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`}
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
