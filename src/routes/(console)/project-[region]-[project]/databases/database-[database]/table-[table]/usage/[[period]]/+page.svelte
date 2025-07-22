<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Usage } from '$lib/layout';
    import Container from '$lib/layout/container.svelte';

    export let data;

    $: count = data.rows;
    $: total = data.rowsTotal;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}/usage`}
        {total}
        {count}
        countMetadata={{
            legend: 'Rows',
            title: 'Total rows'
        }} />
</Container>
