<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: total = data.collectionsTotal;
    $: count = data.collections;
</script>

<Usage
    title="Databases"
    path={`${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${$page.params.database}/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Collections',
        title: 'Total collections'
    }} />
