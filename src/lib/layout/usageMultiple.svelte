<script lang="ts">
    import { page } from '$app/state';
    import { BarChart, Legend, type LegendData } from '$lib/charts';
    import { Card, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { clampMin, formatNumberWithCommas } from '$lib/helpers/numbers';
    import { accumulateFromEndingTotal } from '$lib/layout/usage.svelte';
    import { type Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import type { EChartsOption } from 'echarts';

    type Props = {
        title: string;
        total: number[];
        path?: string | null;
        count: Models.Metric[][];
        legendData: LegendData[];
        showHeader?: boolean;
        legendNumberFormat?: 'comma' | 'abbreviate';
        isCumulative?: boolean;
        options?: EChartsOption | null;
    };

    let {
        title,
        total,
        path = null,
        count,
        legendData,
        showHeader = true,
        legendNumberFormat = 'comma',
        isCumulative = true,
        options = null
    }: Props = $props();

    const formatted = $derived(page.params.period === '24h' ? 'hours' : 'days');
    const totalCount = $derived(clampMin(total.reduce((a, b) => a + b, 0)));
    const series = $derived(
        count.map((metrics, index) => ({
            name: legendData[index].name,
            data: isCumulative
                ? accumulateFromEndingTotal(metrics, total[index])
                : metrics.map((metric) => [metric.date, metric.value])
        }))
    );
</script>

<div>
    {#if showHeader}
        <div class="u-flex u-main-space-between common-section">
            <Typography.Title>{title}</Typography.Title>

            {#if path}
                <SecondaryTabs>
                    <SecondaryTabsItem href={`${path}/24h`} disabled={page.params.period === '24h'}>
                        24h
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        href={`${path}/30d`}
                        disabled={!page.params.period || page.params.period === '30d'}>
                        30d
                    </SecondaryTabsItem>
                    <SecondaryTabsItem href={`${path}/90d`} disabled={page.params.period === '90d'}>
                        90d
                    </SecondaryTabsItem>
                </SecondaryTabs>
            {/if}
        </div>
    {/if}

    <Card>
        {#if count}
            <Layout.Stack gap="xs">
                <Typography.Title>{formatNumberWithCommas(totalCount)}</Typography.Title>
                <Typography.Text>Total {title.toLocaleLowerCase()}</Typography.Text>
            </Layout.Stack>
            <div class="multiple-chart-container u-flex-vertical u-gap-16">
                <BarChart {formatted} {options} {series} />

                {#if legendData}
                    <Legend
                        {legendData}
                        decimalsForAbbreviate={2}
                        numberFormat={legendNumberFormat} />
                {/if}
            </div>
        {/if}
    </Card>
</div>

<style lang="scss">
    .multiple-chart-container {
        height: 12rem;
    }

    :global(.multiple-chart-container .echart) {
        margin-top: -1em;
        margin-bottom: -1em;
    }
</style>
