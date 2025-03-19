<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Container, Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.filesTotal;
    $: count = data.files;
</script>

<Container>
    <Usage
        title="Files"
        path={`${base}/project-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`}
        {total}
        {count}
        countMetadata={{
            legend: 'Files',
            title: 'Total files'
        }} />
</Container>
