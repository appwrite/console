<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    export let data: PageData;

    $: total = data.collectionsTotal;
    $: count = data.collections;

    // types need to be added to console sdk.
    $: reads = data.databaseReads;
    $: readsTotal = data.databaseReadsTotal;

    $: writes = data.databaseWrites;
    $: writesTotal = data.databaseWritesTotal;

    onMount(() => {
        console.log([readsTotal, writesTotal]);
    });
</script>

<Usage
    title="Databases"
    path={`${base}/project-${$page.params.project}/databases/database-${$page.params.database}/usage`}
    {total}
    {count}
    countMetadata={{
        legend: 'Collections',
        title: 'Total collections'
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
