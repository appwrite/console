<script lang="ts">
    import type { EChartsOption } from 'echarts';
    import type { BarSeriesOption } from 'echarts/charts';
    import Base from './base.svelte';

    export let series: BarSeriesOption[];
    export let options: EChartsOption | null = null;
</script>

<Base
    {options}
    series={series.map((s) => {
        s.type = 'bar';
        s.stack = 'total';
        s.barMaxWidth = 6;
        s.itemStyle = {
            borderRadius: [10, 10, 0, 0]
        };

        return s;
    })} />
