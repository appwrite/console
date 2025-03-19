<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;
</script>

<Usage
    path={`${base}/project-${$page.params.project}/functions/usage`}
    countMetadata={{
        legend: 'Functions',
        title: 'Total functions'
    }}
    {total}
    {count} />
