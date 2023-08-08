<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: count = data.databasesTotal;
</script>

<Usage
    title="Databases"
    path={`/console/project-${$page.params.project}/databases/usage`}
    {count}
    countMetadata={{
        legend: 'Databases',
        title: 'Total databases'
    }} />
