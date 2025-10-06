<script lang="ts">
    import { Card } from '$lib/components';
    import { totalMetrics } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { LineChart } from '$lib/charts';
    import { formatNum } from '$lib/helpers/string';
    import {
        ActionMenu,
        Icon,
        Layout,
        Button,
        Popover,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconChartSquareBar,
        IconChevronDown,
        IconChevronUp
    } from '@appwrite.io/pink-icons-svelte';
    import type { EChartsOption } from 'echarts';
    import { generateFakeLineChartData } from '$lib/helpers/faker';
    import ExtendedValueSkeleton from './(components)/skeletons/extended.svelte';
    import { fade } from 'svelte/transition';

    let {
        period,
        loading
    }: {
        period: UsagePeriods;
        loading: boolean;
    } = $props();

    const dispatch = createEventDispatcher();
    const fakeLineChartData = generateFakeLineChartData();

    let requests = $derived(
        $usage?.requests as unknown as Array<{
            date: number;
            value: number;
        }>
    );

    let chartData = $derived(
        loading ? fakeLineChartData : [...requests.map((e) => [e.date, e.value])]
    );

    let chartOptions = $derived.by(() => {
        return {
            animation: true,
            animationDuration: 500,
            animationEasing: 'quadraticInOut',
            animationDurationUpdate: 500,
            animationEasingUpdate: 'quadraticInOut',
            universalTransition: true,
            yAxis: {
                axisLabel: {
                    formatter: (value: number) => (loading ? '--' : formatNum(value))
                }
            },
            tooltip: { show: !loading },
            color: [loading ? 'var(--border-neutral-strong)' : 'var(--bgcolor-accent)']
        } satisfies EChartsOption;
    });

    $effect(() => {
        console.log(totalMetrics($usage?.requests));
    });
</script>

<Layout.Stack gap="l">
    <Layout.Stack justifyContent="space-between" direction="row" alignItems="flex-start">
        <ExtendedValueSkeleton
            {loading}
            metricName="Requests"
            resourceMetric={formatNum(totalMetrics($usage?.requests))} />

        <Popover let:toggle padding="none" let:showing>
            <Button.Button on:click={toggle} variant="extra-compact" disabled={loading}>
                {period}
                <Icon icon={showing ? IconChevronUp : IconChevronDown} slot="end" />
            </Button.Button>

            <ActionMenu.Root width="fit-content" slot="tooltip" let:toggle>
                <ActionMenu.Item.Button
                    on:click={(event) => {
                        toggle(event);
                        dispatch('change', '24h');
                    }}>24h</ActionMenu.Item.Button>
                <ActionMenu.Item.Button
                    on:click={(event) => {
                        toggle(event);
                        dispatch('change', '30d');
                    }}>30d</ActionMenu.Item.Button>
                <ActionMenu.Item.Button
                    on:click={(event) => {
                        toggle(event);
                        dispatch('change', '90d');
                    }}>90d</ActionMenu.Item.Button>
            </ActionMenu.Root>
        </Popover>
    </Layout.Stack>

    <div style="height: 12rem; position: relative;">
        {#if loading || totalMetrics($usage?.requests) !== 0}
            <div
                in:fade|local={{ duration: 500 }}
                out:fade|local={{ duration: 500 }}
                style="position: absolute; inset: 0;">
                <LineChart
                    applyStyles={!loading}
                    options={chartOptions}
                    series={[
                        {
                            name: 'Requests',
                            data: chartData,
                            universalTransition: true
                        }
                    ]} />
            </div>
        {:else}
            <div
                in:fade|local={{ duration: 500 }}
                out:fade|local={{ duration: 500 }}
                style="position: absolute; inset: 0;">
                <Card isDashed fullHeightChild style="height: 100%">
                    <Layout.Stack
                        gap="xs"
                        height="100%"
                        alignItems="center"
                        justifyContent="center">
                        <Icon icon={IconChartSquareBar} size="l" />
                        <Typography.Text variant="m-600">No data to show</Typography.Text>
                    </Layout.Stack>
                </Card>
            </div>
        {/if}
    </div>
</Layout.Stack>
