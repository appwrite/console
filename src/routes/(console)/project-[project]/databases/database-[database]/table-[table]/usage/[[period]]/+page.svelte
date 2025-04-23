<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Usage } from '$lib/layout';
    import Container from '$lib/layout/container.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.documentsTotal;
    $: count = data.documents;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}/usage`}
        {total}
        {count}
        countMetadata={{
            legend: 'Rows',
            title: 'Total rows'
        }} />
</Container>
