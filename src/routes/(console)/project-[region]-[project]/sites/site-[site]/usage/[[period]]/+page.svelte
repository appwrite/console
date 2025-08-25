<script lang="ts">
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: count = data.deployments;
    $: total = data.deploymentsTotal;

    // $: totalBuilds = data.buildsTotal;
    // $: countBuilds = data.builds;
</script>

<Container>
    <Usage
        path={getProjectRoute(`/sites/site-${page.params.site}/usage`)}
        countMetadata={{
            legend: 'Deployments',
            title: 'Total deployments'
        }}
        {total}
        {count} />

    <!-- <Usage
    title="Builds"
    path={getProjectRoute(`/sites/site-${page.params.site}/usage`)}
    countMetadata={{
        legend: 'Builds',
        title: 'Total builds'
        }}
        total={totalBuilds}
        count={countBuilds} /> -->
</Container>
