<script context="module" lang="ts">
    export type LegendData = {
        name: string;
        value: string | number | boolean;
    };
</script>

<script lang="ts">
    import { Colors } from '$lib/charts/config';

    export let legendData: LegendData[] = [];

    let colors = Object.values(Colors);
</script>

<div class="u-flex u-cross-center u-gap-16">
    {#each legendData as { name, value }, index}
        <div class="status u-flex u-cross-baseline u-gap-8">
            <span class="status-icon" style:background-color={colors[index % colors.length]} />
            <span>{name} ({value})</span>
        </div>
    {/each}
</div>
