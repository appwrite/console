<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage, UsageMultiple } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let data;

    $: total = data.tablesTotal;
    $: count = data.tables;

    $: reads = data.databaseReads;
    $: readsTotal = data.databaseReadsTotal;

    $: writes = data.databaseWrites;
    $: writesTotal = data.databaseWritesTotal;
</script>

<Container>
    <Layout.Stack gap="l">
        <Usage
            path={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/usage`}
            {total}
            {count}
            countMetadata={{
                legend: 'Tables',
                title: 'Total tables'
            }} />

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
