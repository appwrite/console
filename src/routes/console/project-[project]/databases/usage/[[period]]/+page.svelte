<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.databasesTotal;
    $: count = data.databases;
    $: totalStorage = data.storageTotal;
    $: countStorage = data.storage;
</script>

<Usage
    title="Databases"
    path={`/console/project-${$page.params.project}/databases/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Databases',
        title: 'Total databases'
    }} />

<Usage
    title="Storage"
    path={`/console/project-${$page.params.project}/databases/usage`}
    total={totalStorage}
    count={countStorage}
    countMetadata={{
        legend: 'Databases',
        title: 'Total storage'
    }} />
