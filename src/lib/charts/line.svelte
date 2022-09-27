<script lang="ts">
    import type { LineSeriesOption } from 'echarts/charts';
    import Base from './base.svelte';

    export let series: LineSeriesOption[];

    function prepareSeries(n: LineSeriesOption[]) {
        return n.map((s) => {
            s.type = 'line';
            s.stack = 'total';
            s.showSymbol = false;

            return s;
        });
    }
</script>

<Base series={prepareSeries(series)} />
