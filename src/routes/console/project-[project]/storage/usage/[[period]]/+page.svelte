<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.bucketsTotal;
    $: count = data.buckets;
</script>

<Usage
    title="Buckets"
    path={`/console/project-${$page.params.project}/storage/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Buckets',
        title: 'Total buckets'
    }} />
