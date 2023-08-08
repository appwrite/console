<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: count = data.filesTotal;
</script>

<Usage
    title="Files"
    path={`/console/project-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`}
    {count}
    countMetadata={{
        legend: 'Files',
        title: 'Total files'
    }} />
