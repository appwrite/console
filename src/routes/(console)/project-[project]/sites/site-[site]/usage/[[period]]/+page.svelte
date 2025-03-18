<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;

    // $: totalBuilds = data.buildsTotal;
    // $: countBuilds = data.builds;

    $: console.log(data);
</script>

<Container>
    <Usage
        title="Deployments"
        path={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/usage`}
        countMetadata={{
            legend: 'Deployments',
            title: 'Total deployments'
        }}
        {total}
        {count} />

    <!-- <Usage
    title="Builds"
    path={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/usage`}
    countMetadata={{
        legend: 'Builds',
        title: 'Total builds'
        }}
        total={totalBuilds}
        count={countBuilds} /> -->
</Container>
