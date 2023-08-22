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
    path={`/console/project-${$page.params.project}/databases/usage`}
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
