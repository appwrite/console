<script lang="ts">
    import { Card, DropList, DropListItem } from '$lib/components';
    import { totalMetrics } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { LineChart } from '$lib/charts';
    import { formatNum } from '$lib/helpers/string';

    export let period: UsagePeriods;

    let showPeriod = false;

    const dispatch = createEventDispatcher();

    $: requests = $usage?.requests as unknown as Array<{
        date: number;
        value: number;
    }>;

    $: if (period) {
        showPeriod = false;
    }
</script>

<div class="u-flex u-gap-16 u-main-space-between">
    <div>
        <div class="heading-level-4">
            {formatNum(totalMetrics($usage?.requests))}
        </div>
        <div>Requests</div>
    </div>
    <DropList bind:show={showPeriod} placement="bottom-start" childStart noArrow>
        <button class="transparent-button" on:click={() => (showPeriod = !showPeriod)}>
            <span class="text">{period}</span>
            <span class="icon-cheveron-down" aria-hidden="true" />
        </button>
        <svelte:fragment slot="list">
            <DropListItem on:click={() => dispatch('change', '24h')}>24h</DropListItem>
            <DropListItem on:click={() => dispatch('change', '30d')}>30d</DropListItem>
            <DropListItem on:click={() => dispatch('change', '90d')}>90d</DropListItem>
        </svelte:fragment>
    </DropList>
</div>
{#if totalMetrics($usage?.requests) !== 0}
    <div style="height: 12rem;">
        <LineChart
            options={{
                yAxis: {
                    axisLabel: {
                        formatter: formatNum
                    }
                }
            }}
            series={[
                {
                    name: 'Requests',
                    data: [...requests.map((e) => [e.date, e.value])]
                }
            ]} />
    </div>
{:else}
    <Card isDashed>
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <span
                class="icon-chart-square-bar text-large"
                aria-hidden="true"
                style="font-size: 32px;" />
            <p class="u-bold">No data to show</p>
        </div>
    </Card>
{/if}
