<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, Legend, type LegendData } from '$lib/charts';
    import { accumulateFromEndingTotal } from '$lib/layout/usage.svelte';
    import { Card, Heading, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { page } from '$app/stores';
    import { type Models } from '@appwrite.io/console';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';

    export let title: string;
    export let total: number[];
    export let path: string = null;
    export let count: Models.Metric[][];
    export let legendData: LegendData[];
    export let showHeader: boolean = true;
    export let overlapContainerCover = false;
    export let legendNumberFormat: 'comma' | 'abbreviate' = 'comma';
</script>

<Container overlapCover={overlapContainerCover}>
    <div class="u-flex u-main-space-between common-section">
        {#if showHeader}
            <Heading tag="h2" size="5">{title}</Heading>
        {/if}

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
            {@const totalCount = total.reduce((a, b) => a + b, 0)}

            <Heading tag="h6" size="6">{formatNumberWithCommas(totalCount)}</Heading>
            <p>Total {title.toLocaleLowerCase()}</p>
            <div class="u-margin-block-start-16" />

            <div class="multiple-chart-container u-flex-vertical u-gap-16">
                <BarChart
                    formatted={$page.params.period === '24h' ? 'hours' : 'days'}
                    series={count.map((c, index) => ({
                        name: legendData[index].name,
                        data: accumulateFromEndingTotal(c, total[index])
                    }))} />

                {#if legendData}
                    <Legend {legendData} numberFormat={legendNumberFormat} />
                {/if}
            </div>
        {/if}
    </Card>
</Container>

<style lang="scss">
    .multiple-chart-container {
        height: 12rem;
    }

    :global(.multiple-chart-container .echart) {
        margin-top: -1em;
        margin-bottom: -1em;
    }
</style>
