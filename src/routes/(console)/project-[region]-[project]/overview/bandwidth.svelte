<script lang="ts">
    import { Card, DropList, DropListItem } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { totalMetrics } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { BarChart } from '$lib/charts';

    export let period: UsagePeriods;

    let showPeriod = false;

    const dispatch = createEventDispatcher();

    $: network = $usage?.network as unknown as Array<{
        date: number;
        value: number;
    }>;

    $: bandwidth = humanFileSize(totalMetrics($usage?.network));

    $: if (period) {
        showPeriod = false;
    }
</script>

<div class="u-flex u-gap-16 u-main-space-between">
    <div>
        <div class="heading-level-4">
            {bandwidth.value}
            <span class="body-text-2">{bandwidth.unit}</span>
        </div>
        <div>Bandwidth</div>
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
{#if bandwidth.value !== '0'}
    <div style="height: 12rem;">
        <BarChart
            options={{
                yAxis: {
                    axisLabel: {
                        formatter: (value) =>
                            value
                                ? `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                                : '0'
                    }
                }
            }}
            series={[
                {
                    name: 'Bandwidth',
                    data: [...network.map((e) => [e.date, e.value])],
                    tooltip: {
                        valueFormatter: (value) =>
                            `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                    }
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
