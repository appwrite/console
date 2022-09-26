<script lang="ts">
    import { registerTheme, use, init } from 'echarts/core';
    import { onDestroy, onMount } from 'svelte';
    import { app } from '$lib/stores/app';
    import type { ECharts } from 'echarts/core';
    import type { LineSeriesOption } from 'echarts/charts';
    import light from './echartLight.json';
    import dark from './echartDark.json';

    registerTheme('light', light);
    registerTheme('dark', dark);

    export let title: string;
    export let series: LineSeriesOption[];

    let chart: ECharts;
    let container: HTMLDivElement;

    $: option = {
        animationDuration: 400,
        title: {
            text: ''
        },
        animation: false,
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            containLabel: true,
            left: 0,
            right: 0,
            bottom: 15,
            top: 15
        },
        xAxis: {
            type: 'time',
            show: false
        },
        yAxis: {
            type: 'value',
            splitNumber: 3,
            minInterval: 1
        },
        series
    };

    let notMerge = false;
    let lazyUpdate = false;
    let timeoutId: unknown;

    $: option && setOption();
    $: if (chart && $app.themeInUse) {
        makeChart();
        setOption();
    }

    onMount(async () => {
        use([
            (await import('echarts/charts')).LineChart,
            (await import('echarts/components')).TitleComponent,
            (await import('echarts/components')).TooltipComponent,
            (await import('echarts/components')).GridComponent,
            (await import('echarts/components')).DatasetComponent,
            (await import('echarts/components')).TransformComponent,
            (await import('echarts/components')).LegendComponent,
            (await import('echarts/features')).LabelLayout,
            (await import('echarts/features')).UniversalTransition,
            (await import('echarts/renderers')).CanvasRenderer
        ]);
        makeChart();
    });

    onDestroy(() => {
        destroyChart();
    });

    const setOption = () => {
        if (chart && !chart.isDisposed()) {
            chart.setOption(option, notMerge, lazyUpdate);
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
        series.forEach((s: LineSeriesOption) => {
            s.type = 'line';
            s.stack = 'total';
            s.showSymbol = false;
        });
    };

    const onResize = () => {
        if (timeoutId == undefined) {
            timeoutId = setTimeout(() => {
                if (chart && !chart.isDisposed()) {
                    chart.resize();
                }
                timeoutId = undefined;
            }, 500);
        }
    };
</script>

<svelte:window on:resize={onResize} />

<div class="echart" bind:this={container} />

<style>
    .echart {
        width: 100%;
        min-height: 12rem;
    }
</style>
