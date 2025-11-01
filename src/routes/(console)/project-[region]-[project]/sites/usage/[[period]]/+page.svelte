<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { BarChart } from '$lib/charts/index.js';
    import Card from '$lib/components/card.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion.js';
    import { Container, Usage } from '$lib/layout';
    import { total as totalMetrics } from '$lib/layout/usage.svelte';
    import { IconChartSquareBar } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let data;
    $: total = data.executionsTotal;
    $: count = data.executions;
    $: gbHoursTotal = (data.buildsMbSecondsTotal + data.executionsMbSecondsTotal) / 1000 / 3600;
    $: gbHoursCount = [...data.buildsMbSeconds, ...data.executionsMbSeconds]
        ?.map((metric) => ({
            ...metric,
            value: metric.value / 1000 / 3600
        }))
        .filter(({ value }) => value);
    $: bandwidth = [...data.inbound, ...data.outbound];
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/sites/usage`}
        countMetadata={{
            legend: 'Executions',
            title: 'executions'
        }}
        {total}
        {count} />

    <Usage
        hidePeriodSelect
        path={`${base}/project-${page.params.region}-${page.params.project}/sites/usage`}
        countMetadata={{
            legend: 'GB hours',
            title: 'GB hours'
        }}
        total={gbHoursTotal}
        count={gbHoursCount} />

    <Card>
        {@const humanized = humanFileSize(totalMetrics(bandwidth))}
        <Layout.Stack gap="s" direction="column" alignItems="baseline">
            <Layout.Stack gap="s" direction="row" alignItems="baseline">
                <Typography.Title>
                    {humanized.value}
                </Typography.Title>
                <Typography.Text>{humanized.unit} bandwidth</Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
        {#if bandwidth?.length > 0}
            <BarChart
                options={{
                    yAxis: {
                        axisLabel: {
                            formatter: (value) =>
                                value
                                    ? `${humanFileSize(+value).value} ${
                                        humanFileSize(+value).unit
                                    }`
                                    : '0'
                        }
                    }
                }}
                series={[
                    {
                        name: 'Bandwidth',
                        data: [...bandwidth.map((e) => [e.date, e.value])],
                        tooltip: {
                            valueFormatter: (value) =>
                                `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                        }
                    }
                ]} />
        {:else}
            <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
                <Icon icon={IconChartSquareBar} size="l" />
                <Typography.Text variant="m-600">No data to show</Typography.Text>
            </Layout.Stack>
        {/if}
    </Card>
</Container>
