<script lang="ts">
    import { Card } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { totalMetrics } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { BarChart } from '$lib/charts';
    import {
        Popover,
        Typography,
        Icon,
        ActionMenu,
        Layout,
        Button
    } from '@appwrite.io/pink-svelte';
    import {
        IconChartSquareBar,
        IconChevronDown,
        IconChevronUp
    } from '@appwrite.io/pink-icons-svelte';
    import type { EChartsOption } from 'echarts';
    import { generateFakeBarChartData } from '$lib/helpers/faker';
    import ExtendedValueSkeleton from './(components)/skeletons/extended.svelte';

    let {
        period,
        loading
    }: {
        period: UsagePeriods;
        loading: boolean;
    } = $props();

    const dispatch = createEventDispatcher();
    const fakeBarChartData = generateFakeBarChartData();

    let network = $derived(
        $usage?.network as unknown as Array<{
            date: number;
            value: number;
        }>
    );

    let bandwidth = $derived(humanFileSize(totalMetrics($usage?.network)));

    let chartData = $derived(loading ? fakeBarChartData : network?.map((e) => [e.date, e.value]));

    let chartOptions = $derived.by(() => {
        return {
            animation: true,
            animationDuration: 500,
            animationEasing: 'cubicOut',

            animationDurationUpdate: 500,
            animationEasingUpdate: 'cubicOut',

            yAxis: {
                axisLabel: {
                    formatter: (value: number) => {
                        return loading
                            ? '-- MB'
                            : !value
                              ? '0'
                              : `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`;
                    }
                }
            },
            tooltip: { show: !loading },
            color: loading ? ['var(--border-neutral)'] : ['var(--bgcolor-accent)']
        } satisfies EChartsOption;
    });
</script>

<Layout.Stack gap="l">
    <Layout.Stack justifyContent="space-between" direction="row" alignItems="flex-start">
        <ExtendedValueSkeleton {loading} resourceMetric={bandwidth} metricName="Bandwidth" />

        <Popover let:toggle padding="none" let:showing>
            <Button.Button on:click={toggle} variant="extra-compact" disabled={loading}>
                {period}
                <Icon icon={showing ? IconChevronUp : IconChevronDown} slot="end" />
            </Button.Button>

            <ActionMenu.Root width="fit-content" slot="tooltip" let:toggle>
                <ActionMenu.Item.Button
                    on:click={(event) => toggle(event) && dispatch('change', '24h')}>
                    24h
                </ActionMenu.Item.Button>
                <ActionMenu.Item.Button
                    on:click={(event) => toggle(event) && dispatch('change', '30d')}>
                    30d
                </ActionMenu.Item.Button>
                <ActionMenu.Item.Button
                    on:click={(event) => toggle(event) && dispatch('change', '90d')}>
                    90d
                </ActionMenu.Item.Button>
            </ActionMenu.Root>
        </Popover>
    </Layout.Stack>

    {#if bandwidth.value !== '0' || loading}
        <div style="height: 12rem;">
            {#key loading}
                <BarChart
                    options={chartOptions}
                    series={[
                        {
                            name: 'Bandwidth',
                            data: chartData,
                            tooltip: loading
                                ? undefined
                                : {
                                      valueFormatter: (value) => {
                                          return `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`;
                                      }
                                  }
                        }
                    ]} />
            {/key}
        </div>
    {:else}
        <Card isDashed style="height: 12rem;" fullHeightChild>
            <Layout.Stack gap="xs" height="100%" alignItems="center" justifyContent="center">
                <Icon icon={IconChartSquareBar} size="l" />
                <Typography.Text variant="m-600">No data to show</Typography.Text>
            </Layout.Stack>
        </Card>
    {/if}
</Layout.Stack>
