<script lang="ts">
    import type { LineSeriesOption } from 'echarts/charts';
    import type { EChartsOption } from 'echarts';
    import { Colors } from './config';
    import Base from './base.svelte';

    export let series: LineSeriesOption[];
    export let options: EChartsOption = null;
</script>

<Base
    {options}
    series={series.map((s) => {
        s.type = 'line';
        s.stack = 'total';
        s.lineStyle = {
            shadowBlur: 38,
            shadowColor: Colors.Primary,
            shadowOffsetY: 15,
            shadowOffsetX: 0
        };
        s.showSymbol = false;

        return s;
    })} />
