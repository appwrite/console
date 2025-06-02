<script lang="ts">
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    export let label: string;
    export let value: number;
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    let adjustedValue = value;

    $: if (label?.toLowerCase() === 'credits' && couponData?.status === 'active') {
        adjustedValue = value - (couponData?.credits || 0);
    } else {
        adjustedValue = value;
    }
</script>

{#if adjustedValue > 0}
    <span class="u-flex u-main-space-between">
        <div class="u-flex u-cross-center u-gap-4">
            <p class="text">
                <span class="icon-tag u-color-text-success" aria-hidden="true"></span>
                <span>
                    {label}
                </span>
            </p>
        </div>
        {#if value >= 100}
            <p class="inline-tag">Credits applied</p>
        {:else}
            <span class="u-color-text-success">-{formatCurrency(adjustedValue)}</span>
        {/if}
    </span>
{/if}
