<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;

    $: console.log(data);
</script>

<Usage
    path={`${base}/project-${$page.params.project}/sites/usage`}
    countMetadata={{
        legend: 'Sites',
        title: 'Total sites'
    }}
    {total}
    {count} />
