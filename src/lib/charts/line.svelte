<script lang="ts">
    import type { EChartsOption } from 'echarts';
    import type { LineSeriesOption } from 'echarts';
    import Base from './base.svelte';

    export let series: LineSeriesOption[];
    export let options: EChartsOption = {};
</script>

<Base
    {options}
    series={series.map((s) => {
        s.type = 'line';
        s.stack = 'total';
        s.showSymbol = false;

        return s;
    })} />
