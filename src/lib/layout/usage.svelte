<script context="module" lang="ts">
    export type UsagePeriods = '24h' | '30d' | '90d';
</script>

<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, LineChart } from '$lib/charts';
    import { Card, DropTabs, DropTabsItem, Heading, Tiles } from '$lib/components';
    import { Colors } from '$lib/charts/config';
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
        <Heading tag="h2" size="5">{title}</Heading>
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
            <Heading tag="h6" size="6">{last(count).value}</Heading>
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
                <Heading tag="h6" size="6">{total(created)}</Heading>
                <p>{createdMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: createdMetadata.legend,
                            data: [...created.map((e) => [e.date, e.value])],
                            color: Colors.Secondary
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if read}
                <Heading tag="h6" size="6">{total(read)}</Heading>
                <p>{readMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: readMetadata.legend,
                            data: [...read.map((e) => [e.date, e.value])],
                            color: Colors.Tertiary
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if updated}
                <Heading tag="h6" size="6">{total(updated)}</Heading>
                <p>{updatedMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: updatedMetadata.legend,
                            data: [...updated.map((e) => [e.date, e.value])],
                            color: Colors.Quaternary
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if deleted}
                <Heading tag="h6" size="6">{total(deleted)}</Heading>
                <p>{deletedMetadata.title}</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: deletedMetadata.legend,
                            data: [...deleted.map((e) => [e.date, e.value])],
                            color: Colors.Quinary
                        }
                    ]} />
            {/if}
        </Card>
    </Tiles>
</Container>
