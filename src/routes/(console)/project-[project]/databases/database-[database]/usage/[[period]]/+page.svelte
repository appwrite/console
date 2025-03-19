<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage, UsageMultiple } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: total = data.collectionsTotal;
    $: count = data.collections;

    $: reads = data.databaseReads;
    $: readsTotal = data.databaseReadsTotal;

    $: writes = data.databaseWrites;
    $: writesTotal = data.databaseWritesTotal;
</script>

<Usage
    path={`${base}/project-${$page.params.project}/databases/database-${$page.params.database}/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Collections',
        title: 'Total collections'
    }} />

<UsageMultiple
    title="Reads and writes"
    showHeader={false}
    overlapContainerCover
    total={[readsTotal, writesTotal]}
    count={[reads, writes]}
    legendData={[
        { name: 'Reads', value: readsTotal },
        { name: 'Writes', value: writesTotal }
    ]} />
