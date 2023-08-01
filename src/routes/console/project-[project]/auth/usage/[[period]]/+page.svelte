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
    title="Users"
    path={`/console/project-${$page.params.project}/auth/usage`}
    {count}
    {created}
    {read}
    {updated}
    {deleted}
    countMetadata={{
        legend: 'Users',
        title: $LL.console.project.legends.teams.users()
    }}
    createdMetadata={{
        legend: 'Create',
        title: $LL.console.project.legends.teams.create()
    }}
    readMetadata={{
        legend: 'Read',
        title: $LL.console.project.legends.teams.read()
    }}
    updatedMetadata={{
        legend: 'Update',
        title: $LL.console.project.legends.teams.update()
    }}
    deletedMetadata={{
        legend: 'Delete',
        title: $LL.console.project.legends.teams.delete()
    }} />
