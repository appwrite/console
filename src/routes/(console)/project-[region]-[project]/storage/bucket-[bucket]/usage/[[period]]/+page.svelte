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
        showAggregateTotal={false}
        isCumulative
        total={filesTotal}
        count={files}
        countMetadata={{
            legend: 'Files uploaded',
            title: 'Files uploaded per day'
        }} />

    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/usage`}
        showAggregateTotal={false}
        total={transformationsTotal}
        count={transformations}
        countMetadata={{
            legend: 'Image transformations',
            title: 'Image transformations per day'
        }}
        isCumulative
        hidePeriodSelect />
</Container>
