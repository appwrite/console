<script context="module" lang="ts">
    export type LegendData = {
        name: string;
        value: string | number | boolean;
    };
</script>

<script lang="ts">
    import { Colors } from '$lib/charts/config';
    import { Status } from '$lib/components';

    export let legendData: LegendData[] = [];

    let colors = Object.values(Colors);
</script>

<div class="u-flex u-cross-center u-gap-16">
    {#each legendData as { name, value }, index}
        <Status status="none" statusIconStyle="background-color: {colors[index % colors.length]}">
            {name} ({value})
        </Status>
    {/each}
</div>
