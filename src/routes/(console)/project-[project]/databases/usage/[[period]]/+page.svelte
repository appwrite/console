<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage, UsageMultiple } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';

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
            path={`${base}/project-${page.params.project}/databases/usage`}
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
