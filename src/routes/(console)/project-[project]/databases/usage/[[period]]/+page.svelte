<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.databasesTotal;
    $: count = data.databases;

    // types need to be added to console sdk.
    $: reads = data.databasesReads;
    $: readsTotal = data.databasesReadsTotal;

    $: writes = data.databasesWrites;
    $: writesTotal = data.databasesWritesTotal;
</script>

<Usage
    title="Databases"
    path={`${base}/project-${$page.params.project}/databases/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Databases',
        title: 'Total databases'
    }} />

<Usage
    title="Databases reads"
    total={readsTotal}
    count={reads}
    countMetadata={{
        legend: 'Databases reads',
        title: 'Total database reads'
    }} />

<Usage
    title="Databases writes"
    total={writesTotal}
    count={writes}
    countMetadata={{
        legend: 'Databases writes',
        title: 'Total databases'
    }} />
