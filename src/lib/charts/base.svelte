<script lang="ts">
    import { registerTheme, use, init } from 'echarts/core';
    import { onDestroy, onMount } from 'svelte';
    import { app } from '$lib/stores/app';
    import { dailyFormat, hourlyFormat, defaultConfig } from './config';
    import base from './base.json';
    import type { ECharts } from 'echarts/core';
    import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
    import type { EChartsOption } from 'echarts';
    import { wizard } from '$lib/stores/wizard';

    registerTheme('light', base);
    registerTheme('dark', base);

    export let options: EChartsOption;
    export let series: (BarSeriesOption | LineSeriesOption)[];
    export let formatted: 'days' | 'hours' = 'days';

    let chart: ECharts;
    let container: HTMLDivElement;

    $: option = {
        ...defaultConfig,
        ...(formatted === 'days' ? dailyFormat : hourlyFormat),
        ...options,
        series
    };

    $: option && setOption();
    $: if (chart && $app.themeInUse) {
        makeChart();
        setOption();
    }

    onMount(async () => {
        use([
            (await import('echarts/charts')).BarChart,
            (await import('echarts/charts')).LineChart,
            (await import('echarts/components')).TitleComponent,
            (await import('echarts/components')).TooltipComponent,
            (await import('echarts/components')).GridComponent,
            (await import('echarts/components')).DatasetComponent,
            (await import('echarts/components')).TransformComponent,
            (await import('echarts/components')).LegendComponent,
            (await import('echarts/features')).LabelLayout,
            (await import('echarts/renderers')).SVGRenderer
        ]);
        makeChart();
    });

    onDestroy(() => {
        destroyChart();
    });

    const setOption = () => {
        if (chart && !chart.isDisposed()) {
            chart.setOption(option);
        }
    };

    const destroyChart = () => {
        if (chart && !chart.isDisposed()) {
            chart.dispose();
        }
    };

    const makeChart = () => {
        destroyChart();
        chart = init(container, $app.themeInUse);
    };

    let timeoutId: unknown;
    const onResize = () => {
        if (timeoutId == undefined && !$wizard.show) {
            timeoutId = setTimeout(() => {
                if (chart && !chart.isDisposed()) {
                    chart.resize();
                }
                timeoutId = undefined;
            }, 250);
        }
    };

    $: if (!$wizard.show) {
        onResize();
    }
</script>

<svelte:window on:resize={onResize} />

<div class="echart" bind:this={container}></div>

<style>
    .echart {
        width: 100%;
        min-height: 10rem;
        height: 100%;
    }
</style>
