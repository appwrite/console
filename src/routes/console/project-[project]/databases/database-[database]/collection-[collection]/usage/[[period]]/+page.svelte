<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: count = data.documentsTotal;
</script>

<Usage
    title="Databases"
    path={`/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}/usage`}
    {count}
    countMetadata={{
        legend: 'Documents',
        title: 'Total documents'
    }} />
