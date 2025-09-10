<script lang="ts">
    import type { LineSeriesOption } from 'echarts/charts';
    import type { EChartsOption } from 'echarts';
    import { Colors } from './config';
    import Base from './base.svelte';

    export let series: LineSeriesOption[];
    export let options: EChartsOption = null;
    export let formatted: 'days' | 'hours' = 'days';

    export let applyStyles: boolean = true;
</script>

<Base
    {options}
    {formatted}
    series={series.map((s) => {
        s.type = 'line';
        s.stack = 'total';
        s.lineStyle = {
            shadowBlur: applyStyles ? 38 : undefined,
            shadowColor: applyStyles ? Colors.Primary : undefined,
            shadowOffsetY: applyStyles ? 15 : undefined,
            shadowOffsetX: 0,
            width: applyStyles ? undefined : 2
        };
        s.showSymbol = false;

        return s;
    })} />
