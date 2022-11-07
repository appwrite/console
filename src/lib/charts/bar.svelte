<script lang="ts">
    import type { BarSeriesOption } from 'echarts/charts';
    import type { EChartsOption } from 'echarts/types/dist/shared';
    import Base from './base.svelte';

    export let series: BarSeriesOption[];
    export let options: EChartsOption = {};
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
