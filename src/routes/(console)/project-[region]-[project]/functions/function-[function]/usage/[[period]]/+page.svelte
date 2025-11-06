<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import Card from '$lib/components/card.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion.js';
    import { BarChart } from '$lib/charts/index.js';
    import { total as totalMetrics } from '$lib/layout/usage.svelte';
    import { IconChartSquareBar } from '@appwrite.io/pink-icons-svelte';

    let { data } = $props();
    let total = $derived(data.executionsTotal);
    let count = $derived(data.executions);
    let gbHoursTotal = $derived((data.buildsMbSecondsTotal + data.executionsMbSecondsTotal) / 1000 / 3600);
    let gbHoursCount = $derived([...data.buildsMbSeconds, ...data.executionsMbSeconds]
        ?.map((metric) => ({
            ...metric,
            value: metric.value / 1000 / 3600
        }))
        .filter(({ value }) => value));
    let bandwidth = $state([]);
</script>

<Container>
    <Layout.Stack gap="l">
        <Usage
            path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
            countMetadata={{
                legend: 'Executions',
                title: 'executions'
            }}
            {total}
            {count} />

        <Usage
            hidePeriodSelect
            path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
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
    </Layout.Stack>
</Container>
