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
</script>

<Usage
    title="Files"
    path={`${base}/project-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`}
    total={filesTotal}
    count={files}
    countMetadata={{
        legend: 'Files',
        title: 'Total files'
    }} />

<Usage
    title="Image Transformations"
    path={`${base}/project-${$page.params.project}/storage/bucket-${$page.params.bucket}/usage`}
    total={transformationsTotal}
    count={transformations}
    countMetadata={{
        legend: 'Image Transformations',
        title: 'Total transformations'
    }}
    hideSelectPeriod />
