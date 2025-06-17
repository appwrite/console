<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: total = data.deploymentsTotal;
    $: count = data.deployments;
</script>

<Container>
    <Usage
        path={getProjectRoute('/functions/usage')}
        countMetadata={{
            legend: 'Functions',
            title: 'Total functions'
        }}
        {total}
        {count} />
</Container>
