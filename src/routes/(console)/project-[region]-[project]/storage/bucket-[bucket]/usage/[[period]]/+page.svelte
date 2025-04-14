<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: filesTotal = data.filesTotal;
    $: files = data.files;
    $: transformationsTotal = data.imageTransformationsTotal;
    $: transformations = data.imageTransformations;

    $: path = `${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`;
</script>

<Usage
    {path}
    title="Files"
    count={files}
    total={filesTotal}
    countMetadata={{
        legend: 'Files',
        title: 'Total files'
    }} />

<Usage
    {path}
    title="Image transformations"
    total={transformationsTotal}
    count={transformations}
    countMetadata={{
        legend: 'Image transformations',
        title: 'Total transformations'
    }}
    isCumulative
    hideSelectPeriod />
