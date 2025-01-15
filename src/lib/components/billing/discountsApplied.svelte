<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { formatCurrency } from '$lib/helpers/numbers';

    export let label: string;
    export let value: number;
</script>

{#if value > 0}
    <span class="u-flex u-main-space-between">
        <div class="u-flex u-cross-center u-gap-4">
            <p class="text">
                <span class="icon-tag u-color-text-success" aria-hidden="true" />
                <span use:tooltip={{ content: label }}>
                    {label}
                </span>
            </p>
        </div>
        {#if value >= 100}
            <p class="inline-tag">Credits applied</p>
        {:else}
            <span class="u-color-text-success">-{formatCurrency(value)}</span>
        {/if}
    </span>
{/if}
