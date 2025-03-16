<script context="module" lang="ts">
    export type LegendData = {
        name: string;
        value: string | number | boolean;
    };
</script>

<script lang="ts">
    import { Colors } from '$lib/charts/config';
    import { Status } from '$lib/components';
    import { abbreviateNumber, formatNumberWithCommas } from '$lib/helpers/numbers';

    export let legendData: LegendData[] = [];
    export let numberFormat: 'comma' | 'abbreviate' = 'comma';

    let colors = Object.values(Colors);
</script>

<div class="u-flex u-cross-center u-gap-16">
    {#each legendData as { name, value }, index}
        {@const formattedValue =
            typeof value === 'number'
                ? numberFormat === 'abbreviate'
                    ? abbreviateNumber(value)
                    : formatNumberWithCommas(value)
                : value}
        <Status status="none" statusIconStyle="background-color: {colors[index % colors.length]}">
            {name} ({formattedValue})
        </Status>
    {/each}
</div>
