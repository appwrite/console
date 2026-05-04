<script lang="ts">
    import { Container, UsageMultiple } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    $: reads = data.databasesReads;
    $: readsTotal = data.databasesReadsTotal;

    $: writes = data.databasesWrites;
    $: writesTotal = data.databasesWritesTotal;
</script>

<Container>
    <Layout.Stack gap="l">
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
