<script lang="ts">
    import { registerTheme, use, init, graphic } from 'echarts/core';
    import type { ECharts } from 'echarts/core';
    import type { LineSeriesOption } from 'echarts/charts';
    import { onDestroy, onMount } from 'svelte';
    import { app } from '$lib/stores/app';
    import light from './echartLight.json';
    import dark from './echartDark.json';

    registerTheme('light', light);
    registerTheme('dark', dark);

    export let series: LineSeriesOption[];
    export let title: string;

    let chart: ECharts;
    $: option = {
        animationDuration: 400,
        title: {
            text: ''
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center'
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'time',
            show: true
        },
        yAxis: { type: 'value' },
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
        chart = init(document.getElementById(`echart-${title}`), $app.themeInUse);
        series.forEach((s: LineSeriesOption, i: number) => {
            s.areaStyle = colorToGradient(chart['_theme'].color[i]);
        });
    };

    function colorToGradient(color: string) {
        return {
            opacity: 0.8,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                    offset: 0,
                    color: `${color}`
                },
                {
                    offset: 1,
                    color: `${color}30`
                }
            ])
        };
    }
    window.onresize = () => {
        if (chart && !chart.isDisposed()) {
            handleResize();
        }
    };
    const handleResize = () => {
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

<div class="echart" id={`echart-${title}`} />

<style>
    .echart {
        width: 100%;
        min-height: 20rem;
    }
</style>
