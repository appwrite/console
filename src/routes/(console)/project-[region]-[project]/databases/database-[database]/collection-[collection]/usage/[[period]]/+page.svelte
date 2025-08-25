<script lang="ts">
    import { page } from '$app/state';
    import { Usage } from '$lib/layout';
    import Container from '$lib/layout/container.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: total = data.documentsTotal;
    $: count = data.documents;
</script>

<Container>
    <Usage
        path={getProjectRoute(
            `/databases/database-${page.params.database}/collection-${page.params.collection}/usage`
        )}
        {total}
        {count}
        countMetadata={{
            legend: 'Documents',
            title: 'Total documents'
        }} />
</Container>
