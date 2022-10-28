import type { EChartsOption } from 'echarts';

export enum Colors {
    Primary = '#F02E65',
    Secondary = '#94DBD1',
    Tertiary = '#A1C4FF',
    Quaternary = '#CBB1FC',
    Quinary = '#FDC584'
}
export const defaultConfig: EChartsOption = {
    color: Object.values(Colors),
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
