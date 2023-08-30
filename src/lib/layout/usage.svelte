<script context="module" lang="ts">
    export type UsagePeriods = '24h' | '30d' | '90d';

    export function last(set: Models.Metric[]): Models.Metric | null {
        if (!set) return null;
        return set.slice(-1)[0] ?? null;
    }

    export function total(set: Models.Metric[]): number {
        return set.reduce((prev, curr) => prev + curr.value, 0);
    }
</script>

<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, LineChart } from '$lib/charts';
    import { Card, SecondaryTabs, SecondaryTabsItem, Heading } from '$lib/components';
    import { Colors } from '$lib/charts/config';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { Tiles } from '../components/index.js';

    type MetricMetadata = {
        title: string;
        legend: string;
    };

    export let title: string;
    export let count: Models.Metric[];
    export let created: Models.Metric[];
    export let read: Models.Metric[];
    export let updated: Models.Metric[];
    export let deleted: Models.Metric[];

    export let countMetadata: MetricMetadata;
    export let createdMetadata: MetricMetadata;
    export let readMetadata: MetricMetadata;
    export let updatedMetadata: MetricMetadata;
    export let deletedMetadata: MetricMetadata;
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
            <Heading tag="h6" size="6">{total(count)}</Heading>
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
    <Tiles>
        <Card isTile>
            {#if created}
                <Heading tag="h6" size="6">{total(created)}</Heading>
                <p>{createdMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <div class="chart-container">
                    <LineChart
                        series={[
                            {
                                name: createdMetadata.legend,
                                data: [...created.map((e) => [e.date, e.value])],
                                color: Colors.Secondary
                            }
                        ]} />
                </div>
            {/if}
        </Card>
        <Card isTile>
            {#if read}
                <Heading tag="h6" size="6">{total(read)}</Heading>
                <p>{readMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <div class="chart-container">
                    <LineChart
                        series={[
                            {
                                name: readMetadata.legend,
                                data: [...read.map((e) => [e.date, e.value])],
                                color: Colors.Tertiary
                            }
                        ]} />
                </div>
            {/if}
        </Card>
        <Card isTile>
            {#if updated}
                <Heading tag="h6" size="6">{total(updated)}</Heading>
                <p>{updatedMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <div class="chart-container">
                    <LineChart
                        series={[
                            {
                                name: updatedMetadata.legend,
                                data: [...updated.map((e) => [e.date, e.value])],
                                color: Colors.Quaternary
                            }
                        ]} />
                </div>
            {/if}
        </Card>
        <Card isTile>
            {#if deleted}
                <Heading tag="h6" size="6">{total(deleted)}</Heading>
                <p>{deletedMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <div class="chart-container">
                    <LineChart
                        series={[
                            {
                                name: deletedMetadata.legend,
                                data: [...deleted.map((e) => [e.date, e.value])],
                                color: Colors.Quinary
                            }
                        ]} />
                </div>
            {/if}
        </Card>
    </Tiles>
</Container>

<style lang="scss">
    .chart-container {
        height: 12rem;
    }
</style>
