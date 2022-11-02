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
    title="Databases"
    path={`/console/project-${$page.params.project}/databases/database-${$page.params.database}/usage`}
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
