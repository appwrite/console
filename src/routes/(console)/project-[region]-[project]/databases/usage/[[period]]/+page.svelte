<script lang="ts">
    import type { PageData } from './$types';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';
    import { Container, Usage, UsageMultiple } from '$lib/layout';

    export let data: PageData;
    $: total = data.databasesTotal;
    $: count = data.databases;

    $: reads = data.databasesReads;
    $: readsTotal = data.databasesReadsTotal;

    $: writes = data.databasesWrites;
    $: writesTotal = data.databasesWritesTotal;
</script>

<Container>
    <Layout.Stack gap="l">
        <Usage
            path={getProjectRoute('/databases/usage')}
            {total}
            {count}
            countMetadata={{
                legend: 'Databases',
                title: 'Total databases'
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
