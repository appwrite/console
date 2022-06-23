<script lang="ts">
    import * as echarts from 'echarts/core';
    import { LineChart } from 'echarts/charts';
    import type { LineSeriesOption } from 'echarts/charts';
    import {
        TitleComponent,
        TooltipComponent,
        GridComponent,
        DatasetComponent,
        TransformComponent,
        LegendComponent
    } from 'echarts/components';
    import { LabelLayout, UniversalTransition } from 'echarts/features';
    import { CanvasRenderer } from 'echarts/renderers';
    import { onDestroy, onMount } from 'svelte';
    import { app } from '$lib/stores/app';
    import light from './echartLight.json';
    import dark from './echartDark.json';

    echarts.use([
        TitleComponent,
        TooltipComponent,
        GridComponent,
        DatasetComponent,
        TransformComponent,
        LegendComponent,
        LineChart,
        LabelLayout,
        UniversalTransition,
        CanvasRenderer
    ]);
    echarts.registerTheme('light', light);
    echarts.registerTheme('dark', dark);

    export let series: LineSeriesOption[];
    export let title: string;

    let myChart: echarts.ECharts;
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
    let timeoutId: any;

    $: option && setOption();
    $: if (myChart && $app.theme) {
        makeChart();
        setOption();
    }

    onMount(() => {
        makeChart();
    });

    onDestroy(() => {
        destroyChart();
    });
    const setOption = () => {
        if (myChart && !myChart.isDisposed()) {
            myChart.setOption(option, notMerge, lazyUpdate);
        }
    };

    const destroyChart = () => {
        if (myChart && !myChart.isDisposed()) {
            myChart.dispose();
        }
    };

    const makeChart = () => {
        destroyChart();
        myChart = echarts.init(document.getElementById(`echart-${title}`), $app.theme);
        series.forEach((s: LineSeriesOption, i: number) => {
            s.areaStyle = colorToGradient(myChart['_theme'].color[i]);
        });
    };

    function colorToGradient(color: string) {
        return {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
        if (myChart && !myChart.isDisposed()) {
            handleResize();
        }
    };
    const handleResize = () => {
        console.log('test');
        if (timeoutId == undefined) {
            timeoutId = setTimeout(() => {
                if (myChart && !myChart.isDisposed()) {
                    myChart.resize();
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
