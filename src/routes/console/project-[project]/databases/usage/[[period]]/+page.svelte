<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';
    import LL from '$i18n/i18n-svelte';

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
        title: $LL.console.project.legends.databases.databases()
    }}
    createdMetadata={{
        legend: 'Create',
        title: $LL.console.project.legends.databases.create()
    }}
    readMetadata={{
        legend: 'Read',
        title: $LL.console.project.legends.databases.read()
    }}
    updatedMetadata={{
        legend: 'Update',
        title: $LL.console.project.legends.databases.update()
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: $LL.console.project.legends.databases.delete()
    }} />
