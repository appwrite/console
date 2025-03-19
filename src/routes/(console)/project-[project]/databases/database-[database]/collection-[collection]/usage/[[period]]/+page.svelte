<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import Container from '$lib/layout/container.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.documentsTotal;
    $: count = data.documents;
</script>

<Container>
    <Usage
        title="Databases"
        path={`${base}/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}/usage`}
        {total}
        {count}
        countMetadata={{
            legend: 'Documents',
            title: 'Total documents'
        }} />
</Container>
