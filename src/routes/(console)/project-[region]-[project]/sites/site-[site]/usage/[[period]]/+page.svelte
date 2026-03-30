<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;

    // $: totalBuilds = data.buildsTotal;
    // $: countBuilds = data.builds;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/usage`}
        showAggregateTotal={false}
        isCumulative
        countMetadata={{
            legend: 'Deployments',
            title: 'Deployments per day'
        }}
        {total}
        {count} />

    <!-- <Usage
    title="Builds"
    path={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/usage`}
    countMetadata={{
        legend: 'Builds',
        title: 'Total builds'
        }}
        total={totalBuilds}
        count={countBuilds} /> -->
</Container>
