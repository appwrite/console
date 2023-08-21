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
    title="Users"
    path={`/console/project-${$page.params.project}/auth/usage`}
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
