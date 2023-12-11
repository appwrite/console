<script context="module" lang="ts">
    export type UsagePeriods = '24h' | '30d' | '90d';

    export function periodToDates(period: UsagePeriods): {
        start: string;
        end: string;
        period: '1h' | '1d';
    } {
        const end = new Date();
        switch (period) {
            case '24h':
                end.setHours(end.getHours() + 24);
                break;
            case '30d':
                end.setDate(end.getDate() + 30);
                break;
            case '90d':
                end.setDate(end.getDate() + 90);
                break;
        }

        return {
            start: new Date().toISOString(),
            end: end.toISOString(),
            period: period === '24h' ? '1h' : '1d'
        };
    }

    export function last(set: Models.Metric[]): Models.Metric | null {
        if (!set) return null;
        return set.slice(-1)[0] ?? null;
    }

    export function total(set: Models.Metric[]): number {
        return set?.reduce((prev, curr) => prev + curr.value, 0) ?? 0;
    }
</script>

<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart } from '$lib/charts';
    import { Card, SecondaryTabs, SecondaryTabsItem, Heading } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';

    type MetricMetadata = {
        title: string;
        legend: string;
    };

    export let title: string;
    export let total: number;
    export let count: Models.Metric[];
    export let countMetadata: MetricMetadata;
    export let path: string = null;
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <Heading tag="h2" size="5">{title}</Heading>
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
    </div>
    <Card>
        {#if count}
            <Heading tag="h6" size="6">{total}</Heading>
            <p>{countMetadata.title}</p>
            <div class="u-margin-block-start-16" />
            <div class="chart-container">
                <BarChart
                    series={[
                        {
                            name: countMetadata.legend,
                            data: [...count.map((e) => [e.date, e.value])]
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
