<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, Legend, type LegendData } from '$lib/charts';
    import { accumulateFromEndingTotal } from '$lib/layout/usage.svelte';
    import { Card, Heading, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { page } from '$app/stores';
    import { type Models } from '@appwrite.io/console';

    export let title: string;
    export let total: number[];
    export let path: string = null;
    export let count: Models.Metric[][];
    export let legendData: LegendData[];
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <Heading tag="h2" size="5">{title}</Heading>
        {#if path}
            <SecondaryTabs>
                <SecondaryTabsItem href={`${path}/24h`} disabled={$page.params.period === '24h'}>
                    24h
                </SecondaryTabsItem>
                <SecondaryTabsItem
                    href={`${path}/30d`}
                    disabled={!$page.params.period || $page.params.period === '30d'}>
                    30d
                </SecondaryTabsItem>
                <SecondaryTabsItem href={`${path}/90d`} disabled={$page.params.period === '90d'}>
                    90d
                </SecondaryTabsItem>
            </SecondaryTabs>
        {/if}
    </div>
    <Card>
        {#if count}
            <div class="u-flex-vertical">
                <div class="chart-container">
                    <BarChart
                        formatted={$page.params.period === '24h' ? 'hours' : 'days'}
                        series={count.map((c, index) => ({
                            name: legendData[index].name,
                            data: accumulateFromEndingTotal(c, total[index])
                        }))} />
                </div>

                {#if legendData}
                    <Legend {legendData} />
                {/if}
            </div>
        {/if}
    </Card>
</Container>

<style lang="scss">
    .chart-container {
        height: 12rem;
    }

    :global(.chart-container .echart) {
        margin-top: -1rem;
    }
</style>
