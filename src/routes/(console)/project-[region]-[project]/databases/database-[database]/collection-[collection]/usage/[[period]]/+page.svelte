<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Usage } from '$lib/layout';
    import Container from '$lib/layout/container.svelte';

    export let data;
    $: total = data.documentsTotal;
    $: count = data.documents;
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Container expanded slotSpacing paddingInlineEnd databasesScreen>
        <Usage
            path={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/usage`}
            {total}
            {count}
            countMetadata={{
                legend: 'Documents',
                title: 'Total documents'
            }} />
    </Container>
</div>
