<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: total = data.bucketsTotal;
    $: count = data.buckets;
</script>

<Container>
    <Usage
        path={getProjectRoute('/storage/usage')}
        {total}
        {count}
        countMetadata={{
            legend: 'Buckets',
            title: 'Total buckets'
        }} />
</Container>
