<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: total = data.bucketsTotal;
    $: count = data.buckets;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/storage/usage`}
        {total}
        {count}
        countMetadata={{
            legend: 'Buckets',
            title: 'Total buckets'
        }} />
</Container>
