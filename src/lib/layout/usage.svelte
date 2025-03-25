<script context="module" lang="ts">
    export type UsagePeriods = '24h' | '30d' | '90d';

    export function periodToDates(period: UsagePeriods): {
        start: string;
        end: string;
        period: ProjectUsageRange;
    } {
        const start = new Date();
        switch (period) {
            case '24h':
                start.setUTCHours(start.getHours() - 24);
                break;
            case '30d':
                start.setUTCHours(0, 0, 0, 0);
                start.setUTCDate(start.getDate() - 30);
                break;
            case '90d':
                start.setUTCHours(0, 0, 0, 0);
                start.setUTCDate(start.getDate() - 90);
                break;
        }
        const end = new Date();
        end.setUTCDate(end.getUTCDate() + 1);
        end.setUTCHours(0, 0, 0, 0);
        return {
            start: start.toISOString(),
            end: end.toISOString(),
            period: period === '24h' ? ProjectUsageRange.OneHour : ProjectUsageRange.OneDay
        };
    }

    export function last(set: Models.Metric[]): Models.Metric | null {
        if (!set) return null;
        return set.slice(-1)[0] ?? null;
    }

    export function total(set: Models.Metric[]): number {
        return set?.reduce((prev, curr) => prev + curr.value, 0) ?? 0;
    }

    export function accumulateFromEndingTotal(
        metrics: Models.Metric[],
        endingTotal: number,
        startingDayToFillZero: Date = null
    ): Array<[string, number]> {
        return (metrics ?? []).reduceRight(
            (acc, curr) => {
                if (startingDayToFillZero !== null && startingDayToFillZero instanceof Date) {
                    const date = new Date(curr.date);
                    if (date > startingDayToFillZero) {
                        acc.data.unshift([date.toISOString(), 0]);
                        acc.total -= 0;

                        return acc;
                    }
                }
                acc.data.unshift([curr.date, acc.total]);
                acc.total -= curr.value;
                return acc;
            },
            {
                total: endingTotal,
                data: []
            }
        ).data;
    }
</script>

<script lang="ts">
    import { page } from '$app/stores';
    import { BarChart } from '$lib/charts';
    import { Card, Heading, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { Container } from '$lib/layout';
    import { ProjectUsageRange, type Models } from '@appwrite.io/console';

    type MetricMetadata = {
        title: string;
        legend: string;
    };

    export let title: string;
    export let total: number;
    export let count: Models.Metric[];
    export let countMetadata: MetricMetadata;
    export let path: string = null;
    export let hideSelectPeriod: boolean = false;
    export let isCumulative: boolean = false;
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <Heading tag="h2" size="5">{title}</Heading>
        {#if !hideSelectPeriod}
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
            <Heading tag="h6" size="6">{formatNumberWithCommas(total)}</Heading>
            <p>{countMetadata.title}</p>
            <div class="u-margin-block-start-16" />
            <div class="chart-container">
                <BarChart
                    formatted={$page.params.period === '24h' ? 'hours' : 'days'}
                    series={[
                        {
                            name: countMetadata.legend,
                            data: isCumulative
                                ? count.map((m) => [m.date, m.value])
                                : accumulateFromEndingTotal(count, total)
                        }
                    ]} />
            </div>
        {/if}
    </Card>
</Container>

<style lang="scss">
    .chart-container {
        height: 12rem;
    }
</style>
