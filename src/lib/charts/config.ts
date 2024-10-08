import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
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
    grid: {
        containLabel: true,
        left: 0,
        right: 0,
        bottom: 0,
        top: 45
    },
    xAxis: {
        type: 'time',
        show: false
    },
    yAxis: {
        type: 'value',
        splitNumber: 3,
        minInterval: 1,
        splitLine: {
            lineStyle: {
                width: 1
            }
        }
    }
};

export const dailyFormat: EChartsOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            label: {
                formatter: function (params) {
                    const date = new Date(params.value);
                    return toLocaleDate(date.toString());
                }
            }
        }
    }
};

export const hourlyFormat: EChartsOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            label: {
                formatter: function (params) {
                    const date = new Date(params.value);
                    return toLocaleDateTime(date.toString());
                }
            }
        }
    }
};
