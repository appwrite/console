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
    title="Files"
    path={`/console/project-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`}
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Files',
        title: $LL.console.project.legends.storage.usage.files()
    }}
    createdMetadata={{
        legend: 'Create',
        title: $LL.console.project.legends.storage.usage.create()
    }}
    readMetadata={{
        legend: 'Read',
        title: $LL.console.project.legends.storage.usage.read()
    }}
    updatedMetadata={{
        legend: 'Update',
        title: $LL.console.project.legends.storage.usage.update()
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: $LL.console.project.legends.storage.usage.delete()
    }} />
