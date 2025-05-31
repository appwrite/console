<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: filesTotal = data.filesTotal;
    $: files = data.files;
    $: transformationsTotal = data.imageTransformationsTotal;
    $: transformations = data.imageTransformations;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/usage`}
        total={filesTotal}
        count={files}
        countMetadata={{
            legend: 'Files',
            title: 'Total files'
        }} />

    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/usage`}
        total={transformationsTotal}
        count={transformations}
        countMetadata={{
            legend: 'Image transformations',
            title: 'Total transformations'
        }}
        isCumulative
        hidePeriodSelect />
</Container>
