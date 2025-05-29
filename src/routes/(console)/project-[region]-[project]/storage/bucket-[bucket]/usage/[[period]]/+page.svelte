<script lang="ts">
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: filesTotal = data.filesTotal;
    $: files = data.files;
    $: transformationsTotal = data.imageTransformationsTotal;
    $: transformations = data.imageTransformations;
</script>

<Container>
    <Usage
        path={getProjectRoute(`/storage/bucket-${page.params.bucket}/usage`)}
        total={filesTotal}
        count={files}
        countMetadata={{
            legend: 'Files',
            title: 'Total files'
        }} />

    <Usage
        path={getProjectRoute(`/storage/bucket-${page.params.bucket}/usage`)}
        total={transformationsTotal}
        count={transformations}
        countMetadata={{
            legend: 'Image transformations',
            title: 'Total transformations'
        }}
        isCumulative
        hidePeriodSelect />
</Container>
