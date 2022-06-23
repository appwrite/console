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
    // Features like Universal Transition and Label Layout
    import { LabelLayout, UniversalTransition } from 'echarts/features';
    // Import the Canvas renderer
    // Note that introducing the CanvasRenderer or SVGRenderer is a required step
    import { CanvasRenderer } from 'echarts/renderers';
    import { onMount } from 'svelte';
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

    export let series: LineSeriesOption[];
    export let title: string;

    onMount(() => {
        echarts.registerTheme('light', light);
        echarts.registerTheme('dark', dark);

        let myChart = echarts.init(document.getElementById(`echart-${title}`), $app.theme);
        series.forEach((s: LineSeriesOption, i: number) => {
            s.areaStyle = colorToGradient(myChart['_theme'].color[i]);
        });

        myChart.setOption({
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
        });

        window.onresize = function () {
            myChart.resize();
        };
    });

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
</script>

<div class="echart" id={`echart-${title}`} />

<style>
    .echart {
        width: 100%;
        min-height: 20rem;
    }
</style>
