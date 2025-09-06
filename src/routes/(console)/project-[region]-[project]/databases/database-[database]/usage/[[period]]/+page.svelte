<script lang="ts">
    import { Container, UsageMultiple } from '$lib/layout';

    export let data;

    $: reads = data.databaseReads;
    $: readsTotal = data.databaseReadsTotal;

    $: writes = data.databaseWrites;
    $: writesTotal = data.databaseWritesTotal;
</script>

<Container>
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
</Container>
