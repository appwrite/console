<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, SecondaryTabsItem, SecondaryTabs, Heading } from '$lib/components';
    import { BarChart } from '$lib/charts';
    import { page } from '$app/stores';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.executionsTotal;
    $: count = data.executions;
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
            <Heading tag="h6" size="6">{total}</Heading>
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
</Container>
