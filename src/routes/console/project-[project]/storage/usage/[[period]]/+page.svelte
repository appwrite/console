<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: count = data.bucketsTotal;
</script>

<Usage
    title="Buckets"
    path={`/console/project-${$page.params.project}/storage/usage`}
    {count}
    countMetadata={{
        legend: 'Buckets',
        title: 'Total buckets'
    }} />
