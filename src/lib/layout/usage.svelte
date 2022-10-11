<script context="module" lang="ts">
    export type UsagePeriods = '24h' | '30d' | '90d';
</script>

<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, LineChart } from '$lib/charts';
    import { Card, DropTabs, DropTabsItem, Tiles } from '$lib/components';
    import type { Models } from '@aw-labs/appwrite-console';

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

    export let range: UsagePeriods;

    function last(set: Models.Metric[]): Models.Metric | null {
        return set.slice(-1)[0] ?? null;
    }

    function total(set: Models.Metric[]): number {
        return set.reduce((prev, curr) => prev + curr.value, 0);
    }
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <h2 class="heading-level-5">{title}</h2>
        <DropTabs>
            <DropTabsItem on:click={() => (range = '24h')} disabled={range === '24h'}>
                24h
            </DropTabsItem>
            <DropTabsItem on:click={() => (range = '30d')} disabled={range === '30d'}>
                30d
            </DropTabsItem>
            <DropTabsItem on:click={() => (range = '90d')} disabled={range === '90d'}>
                90d
            </DropTabsItem>
        </DropTabs>
    </div>
    <Card>
        {#if count}
            <h6 class="heading-level-6">{last(count).value}</h6>
            <p>{countMetadata.title}</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: countMetadata.legend,
                        data: [...count.map((e) => [e.date, e.value])]
                    }
                ]} />
        {/if}
    </Card>
    <Tiles>
        <Card isTile>
            {#if created}
                <h6 class="heading-level-6">{total(created)}</h6>
                <p>{createdMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: createdMetadata.legend,
                            data: [...created.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if read}
                <h6 class="heading-level-6">{total(read)}</h6>
                <p>{readMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: readMetadata.legend,
                            data: [...read.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if updated}
                <h6 class="heading-level-6">{total(updated)}</h6>
                <p>{updatedMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: updatedMetadata.legend,
                            data: [...updated.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if deleted}
                <h6 class="heading-level-6">{total(deleted)}</h6>
                <p>{deletedMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: deletedMetadata.legend,
                            data: [...deleted.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
    </Tiles>
</Container>
