<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { clampMin } from '$lib/helpers/numbers';
    import { formatNum } from '$lib/helpers/string';
    import { Container, UsageMultiple } from '$lib/layout';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const reads = $derived(data.databaseReads ?? []);
    const readsTotal = $derived(clampMin(reads.reduce((sum, item) => sum + item.value, 0)));

    const writes = $derived(data.databaseWrites ?? []);
    const writesTotal = $derived(clampMin(writes.reduce((sum, item) => sum + item.value, 0)));

    const usagePath = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/usage`
    );
</script>

<Container databasesMainScreen>
    <UsageMultiple
        title="Reads and writes"
        path={usagePath}
        total={[readsTotal, writesTotal]}
        count={[reads, writes]}
        isCumulative={false}
        options={{
            yAxis: {
                axisLabel: {
                    formatter: formatNum
                }
            }
        }}
        legendNumberFormat="abbreviate"
        legendData={[
            { name: 'Reads', value: readsTotal },
            { name: 'Writes', value: writesTotal }
        ]} />
</Container>
