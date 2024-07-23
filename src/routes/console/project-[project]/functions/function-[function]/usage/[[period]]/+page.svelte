<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, SecondaryTabsItem, SecondaryTabs, Heading } from '$lib/components';
    import { BarChart } from '$lib/charts';
    import { page } from '$app/stores';
    import type { PageData } from './$types';
    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';

    export let data: PageData;
    $: total = data.executionsTotal;
    $: count = data.executions;
    $: deploymentsStorageTotal = data.deploymentsStorageTotal;
    $: deploymentsStorage = data.deploymentsStorage;
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <Heading tag="h2" size="5">Functions</Heading>
        <SecondaryTabs>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/functions/function-${data.function.$id}/usage/24h`}
                disabled={($page.params.period ?? '24h') === '24h'}>
                24h
            </SecondaryTabsItem>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/functions/function-${data.function.$id}/usage/30d`}
                disabled={$page.params.period === '30d'}>
                30d
            </SecondaryTabsItem>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/functions/function-${data.function.$id}/usage/90d`}
                disabled={$page.params.period === '90d'}>
                90d
            </SecondaryTabsItem>
        </SecondaryTabs>
    </div>
    {#if count}
        <Card>
            <Heading tag="h6" size="6">{formatNumberWithCommas(total)}</Heading>
            <p>Executions</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: 'Count of function executions over time',
                        data: [...count.map((e) => [e.date, e.value])]
                    }
                ]} />
        </Card>
    {/if}
    {#if deploymentsStorage}
    <Card>
        <Heading tag="h6" size="6">{humanFileSize(deploymentsStorageTotal).value}{humanFileSize(deploymentsStorageTotal).unit}</Heading>
        <p>Deployments Storage</p>
        <div class="u-margin-block-start-16" />
        <BarChart
            options={{
                yAxis: {
                    axisLabel: {
                        formatter: (value) =>
                            value
                                ? `${humanFileSize(+value).value} ${
                                    humanFileSize(+value).unit
                                }`
                                : '0'
                    }
                }
            }}
            series={[
                {
                    name: 'Bandwidth',
                    data: [
                        ...deploymentsStorage.map((e) => [e.date, e.value])
                    ],
                    tooltip: {
                        valueFormatter: (value) =>
                            `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                    }
                }
            ]} />
    </Card>
{/if}
</Container>