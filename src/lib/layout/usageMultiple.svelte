<script lang="ts">
    import { BarChart, Legend, type LegendData } from '$lib/charts';
    import { accumulateFromEndingTotal } from '$lib/layout/usage.svelte';
    import { Card, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { page } from '$app/stores';
    import { type Models } from '@appwrite.io/console';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let title: string;
    export let total: number[];
    export let path: string = null;
    export let count: Models.Metric[][];
    export let legendData: LegendData[];
    export let showHeader: boolean = true;
</script>

<div>
    {#if showHeader}
        <div class="u-flex u-main-space-between common-section">
            <Typography.Title>{title}</Typography.Title>

            {#if path}
                <SecondaryTabs>
                    <SecondaryTabsItem
                        href={`${path}/24h`}
                        disabled={$page.params.period === '24h'}>
                        24h
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        href={`${path}/30d`}
                        disabled={!$page.params.period || $page.params.period === '30d'}>
                        30d
                    </SecondaryTabsItem>
                    <SecondaryTabsItem
                        href={`${path}/90d`}
                        disabled={$page.params.period === '90d'}>
                        90d
                    </SecondaryTabsItem>
                </SecondaryTabs>
            {/if}
        </div>
    {/if}

    <Card>
        {#if count}
            {@const totalCount = total.reduce((a, b) => a + b, 0)}

            <Layout.Stack gap="xs">
                <Typography.Title>{formatNumberWithCommas(totalCount)}</Typography.Title>
                <Typography.Text>Total {title.toLocaleLowerCase()}</Typography.Text>
            </Layout.Stack>
            <div class="multiple-chart-container u-flex-vertical u-gap-16">
                <BarChart
                    formatted={$page.params.period === '24h' ? 'hours' : 'days'}
                    series={count.map((c, index) => ({
                        name: legendData[index].name,
                        data: accumulateFromEndingTotal(c, total[index])
                    }))} />

                {#if legendData}
                    <Legend {legendData} />
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
