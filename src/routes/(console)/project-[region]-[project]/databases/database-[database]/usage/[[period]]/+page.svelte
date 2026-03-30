<script lang="ts">
    import { Container, UsageMultiple } from '$lib/layout';

    export let data;

    $: reads = data.databaseReads;

    $: writes = data.databaseWrites;
</script>

<Container databasesMainScreen>
    <UsageMultiple
        title="Reads and writes"
        showHeader={false}
        count={[reads, writes]}
        seriesNames={['Reads', 'Writes']} />
</Container>
