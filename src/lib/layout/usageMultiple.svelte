<script lang="ts">
    import { BarChart, Legend } from '$lib/charts';
    import { Card } from '$lib/components';
    import { page } from '$app/state';
    import { type Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let title: string;
    export let description: string = '';
    export let count: Models.Metric[][];
    export let seriesNames: string[];
    export let showHeader: boolean = true;
</script>

<div>
    {#if showHeader}
        <div class="u-flex u-main-space-between common-section">
            <Typography.Title>{title}</Typography.Title>
        </div>
    {/if}

    <Card>
        {#if count}
            {#if description}
                <Layout.Stack gap="xs">
                    <Typography.Text>{description}</Typography.Text>
                </Layout.Stack>
            {/if}
            <div class="multiple-chart-container u-flex-vertical u-gap-16">
                <BarChart
                    formatted={page.params.period === '24h' ? 'hours' : 'days'}
                    series={count.map((c, index) => ({
                        name: seriesNames[index],
                        data: c.map((metric) => [metric.date, metric.value])
                    }))} />
                <Legend
                    showValues={false}
                    legendData={seriesNames.map((name) => ({ name, value: '' }))} />
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
