<script lang="ts">
    import type { BarSeriesOption } from 'echarts/charts';
    import Base from './base.svelte';

    export let series: BarSeriesOption[];

    function prepareSeries(n: BarSeriesOption[]) {
        return n.map((s) => {
            s.type = 'bar';
            s.stack = 'total';
            s.barMaxWidth = 6;
            s.itemStyle = {
                borderRadius: [10, 10, 0, 0]
            };

            return s;
        });
    }
</script>

<Base series={prepareSeries(series)} />
