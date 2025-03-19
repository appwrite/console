<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage, UsageMultiple } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.databasesTotal;
    $: count = data.databases;

    $: reads = data.databasesReads;
    $: readsTotal = data.databasesReadsTotal;

    $: writes = data.databasesWrites;
    $: writesTotal = data.databasesWritesTotal;
</script>

<Usage
    path={`${base}/project-${$page.params.project}/databases/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Databases',
        title: 'Total databases'
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
