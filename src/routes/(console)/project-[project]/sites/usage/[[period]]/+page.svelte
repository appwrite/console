<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;

    $: console.log(data);
</script>

<Container>
    <Usage
        title="Sites"
        path={`${base}/project-${$page.params.project}/sites/usage`}
        countMetadata={{
            legend: 'Sites',
            title: 'Total sites'
        }}
        {total}
        {count} />
</Container>
