<script lang="ts">
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
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
        title: $LL.console.project.legends.storage.buckets()
    }}
    createdMetadata={{
        legend: 'Create',
        title: $LL.console.project.legends.storage.create()
    }}
    readMetadata={{
        legend: 'Read',
        title: $LL.console.project.legends.storage.read()
    }}
    updatedMetadata={{
        legend: 'Update',
        title: $LL.console.project.legends.storage.update()
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: $LL.console.project.legends.storage.delete()
    }} />
