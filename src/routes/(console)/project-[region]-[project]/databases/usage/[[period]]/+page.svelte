<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, UsageMultiple } from '$lib/layout';
    import { InputSelect } from '$lib/elements/forms';
    import { clampMin } from '$lib/helpers/numbers';
    import { formatNum } from '$lib/helpers/string';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const reads = $derived(data.databasesReads ?? []);
    const readsTotal = $derived(clampMin(reads.reduce((sum, item) => sum + item.value, 0)));

    const writes = $derived(data.databasesWrites ?? []);
    const writesTotal = $derived(clampMin(writes.reduce((sum, item) => sum + item.value, 0)));

    const usagePath = $derived(
        `${base}/project-${page.params.region}-${page.params.project}/databases/usage`
    );
</script>

<Container>
    <Layout.Stack gap="l">
        <div
            style:max-width="250px"
            style:--input-background-color="var(--bgcolor-neutral-primary)">
            <InputSelect
                on:change={(e) => goto(`${usagePath}/${e.detail}`)}
                id="period"
                options={[
                    {
                        label: '24 hours',
                        value: '24h'
                    },
                    {
                        label: '30 days',
                        value: '30d'
                    },
                    {
                        label: '90 days',
                        value: '90d'
                    }
                ]}
                value={page.params.period ?? '30d'} />
        </div>

        <UsageMultiple
            title="Reads and writes"
            showHeader={false}
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
    </Layout.Stack>
</Container>
