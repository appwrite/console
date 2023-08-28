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
    path={`/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}/usage`}
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
