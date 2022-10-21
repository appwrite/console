<script lang="ts">
    import { page } from '$app/stores';
    import { functionUsage } from '../store';
    import { Container } from '$lib/layout';
    import type { UsagePeriods } from '$lib/layout/usage.svelte';
    import { Card, DropTabs, DropTabsItem, Heading } from '$lib/components';
    import type { Models } from '@aw-labs/appwrite-console';

    const functionId = $page.params.function;
    import { last } from '$lib/layout/usage.svelte';
    import { BarChart } from '$lib/charts';
    let range: UsagePeriods = '30d';

    $: functionUsage.load(functionId, range);

    // TODO: metric type is wrong
    $: count = $functionUsage?.executionsTotal as unknown as Models.Metric[];
    $: errors = $functionUsage?.buildsFailure as unknown as Models.Metric[];
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <Heading tag="h2" size="5">Functions</Heading>
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
    {#if count}
        <Card>
            <Heading tag="h6" size="6">{last(count).value}</Heading>
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
    {#if errors}
        <Card>
            <Heading tag="h6" size="6">{last(errors).value}</Heading>
            <p>Errors</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: 'Count of function errors over time',
                        data: [...errors.map((e) => [e.date, e.value])]
                    }
                ]} />
        </Card>
    {/if}
</Container>
