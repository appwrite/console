import type { EChartsOption } from 'echarts';

export const defaultConfig: EChartsOption = {
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
    }
};
