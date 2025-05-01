<script lang="ts">
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let value: number;
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };
    export let fixedCoupon = false;
</script>

{#if value > 0}
    <span class="u-flex u-main-space-between">
        <div class="u-flex u-cross-center u-gap-4">
            <p class="text">
                <span class="icon-tag u-color-text-success" aria-hidden="true"></span>
                <span>
                    {label}
                </span>
            </p>
            {#if !fixedCoupon && label.toLowerCase() === 'credits'}
                <button
                    type="button"
                    class="button is-text is-only-icon"
                    style="--button-size:1.5rem;"
                    aria-label="Close"
                    title="Close"
                    on:click={() =>
                        (couponData = {
                            code: null,
                            status: null,
                            credits: null
                        })}>
                    <Icon icon={IconX} />
                </button>
            {/if}
        </div>
        {#if value >= 100}
            <p class="inline-tag">Credits applied</p>
        {:else}
            <span class="u-color-text-success">-{formatCurrency(value)}</span>
        {/if}
    </span>
{/if}
