<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/functions/usage`}
        showAggregateTotal={false}
        isCumulative
        countMetadata={{
            legend: 'Deployments',
            title: 'Function deployments per day'
        }}
        {total}
        {count} />
</Container>
