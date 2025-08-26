<script lang="ts">
    import { page } from '$app/state';
    import { Container, Usage, UsageMultiple } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;

    $: total = data.collectionsTotal;
    $: count = data.collections;

    $: reads = data.databaseReads;
    $: readsTotal = data.databaseReadsTotal;

    $: writes = data.databaseWrites;
    $: writesTotal = data.databaseWritesTotal;
</script>

<Container>
    <Layout.Stack gap="l">
        <Usage
            {total}
            {count}
            countMetadata={{
                legend: 'Collections',
                title: 'Total collections'
            }}
            path={getProjectRoute(`/databases/database-${page.params.database}/usage`)} />

        <UsageMultiple
            title="Reads and writes"
            showHeader={false}
            total={[readsTotal, writesTotal]}
            count={[reads, writes]}
            legendNumberFormat="abbreviate"
            legendData={[
                { name: 'Reads', value: readsTotal },
                { name: 'Writes', value: writesTotal }
            ]} />
    </Layout.Stack>
</Container>
