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
        endingTotal: number
    ): Array<[string, number]> {
        return (metrics ?? []).reduceRight(
            (acc, curr) => {
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
    import { Container } from '$lib/layout';
    import { BarChart } from '$lib/charts';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { Card } from '$lib/components';
    import { ProjectUsageRange, type Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { goto } from '$app/navigation';
    import { InputSelect } from '$lib/elements/forms';

    type MetricMetadata = {
        title: string;
        legend: string;
    };

    export let total: number;
    export let count: Models.Metric[];
    export let countMetadata: MetricMetadata;
    export let path: string = null;
    export let hidePeriodSelect = false;
</script>

<Container>
    <Layout.Stack gap="s">
        {#if !hidePeriodSelect}
            <div
                style:max-width="250px"
                style:--input-background-color="var(--bgcolor-neutral-primary)">
                <InputSelect
                    on:change={(e) => goto(`${path}/${e.detail}`)}
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
                    value={$page.params.period ?? '30d'} />
            </div>
        {/if}
        <Card>
            {#if count}
                <Layout.Stack gap="xs">
                    <Typography.Title>{formatNumberWithCommas(total)}</Typography.Title>
                    <Typography.Text>{countMetadata.title}</Typography.Text>
                </Layout.Stack>
                <div class="chart-container">
                    <BarChart
                        formatted={$page.params.period === '24h' ? 'hours' : 'days'}
                        series={[
                            {
                                name: countMetadata.legend,
                                data: accumulateFromEndingTotal(count, total)
                            }
                        ]} />
                </div>
            {/if}
        </Card>
    </Layout.Stack>
</Container>

<style lang="scss">
    .chart-container {
        height: 12rem;
    }
</style>
