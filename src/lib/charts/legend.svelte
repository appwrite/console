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
    export let decimalsForAbbreviate: number = 1;
    export let numberFormat: 'comma' | 'abbreviate' = 'comma';
    export let showValues: boolean = true;

    let colors = Object.values(Colors);
</script>

<div class="u-flex u-cross-center u-gap-16">
    {#each legendData as { name, value }, index}
        {@const formattedValue = showValues
            ? typeof value === 'number'
                ? numberFormat === 'comma'
                    ? formatNumberWithCommas(value)
                    : abbreviateNumber(value, decimalsForAbbreviate)
                : value
            : null}
        <Status status="none" statusIconStyle="background-color: {colors[index % colors.length]}">
            {#if showValues}
                {name} ({formattedValue})
            {:else}
                {name}
            {/if}
        </Status>
    {/each}
</div>
