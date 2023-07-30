<script lang="ts">
    import { Card, DropList, DropListItem } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { total } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { BarChart } from '$lib/charts';
    import LL from '$i18n/i18n-svelte';

    export let period: UsagePeriods;

    let showPeriod = false;

    const dispatch = createEventDispatcher();

    $: network = $usage?.network as unknown as Array<{
        date: number;
        value: number;
    }>;
    $: bandwith = humanFileSize(total($usage.network));

    $: if (period) {
        showPeriod = false;
    }
</script>

<div class="u-flex u-gap-16 u-main-space-between">
    <div>
        <div class="heading-level-4">
            {bandwith.value}
            <span class="body-text-2 u-bold">{bandwith.unit}</span>
        </div>
        <div>{$LL.console.project.title.bandwith()}</div>
    </div>
    <DropList bind:show={showPeriod} placement="bottom-start" childStart noArrow>
        <button class="transparent-button" on:click={() => (showPeriod = !showPeriod)}>
            <span class="text">{period}</span>
            <span class="icon-cheveron-down" aria-hidden="true" />
        </button>
        <svelte:fragment slot="list">
            <DropListItem on:click={() => dispatch('change', '24h')}
                >{$LL.console.project.button.dropdown.twentyFour()}</DropListItem>
            <DropListItem on:click={() => dispatch('change', '30d')}
                >{$LL.console.project.button.dropdown.thirty()}</DropListItem>
            <DropListItem on:click={() => dispatch('change', '90d')}
                >{$LL.console.project.button.dropdown.ninty()}</DropListItem>
        </svelte:fragment>
    </DropList>
</div>
{#if bandwith.value !== '0'}
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
            <p class="u-bold">{$LL.console.project.texts.overview.noData()}</p>
        </div>
    </Card>
{/if}
