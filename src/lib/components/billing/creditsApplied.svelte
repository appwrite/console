<script lang="ts">
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    import { Tooltip } from '@appwrite.io/pink-svelte';

    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };
    export let fixedCoupon = false;
</script>

{#if couponData?.credits}
    <span class="u-flex u-main-space-between">
        <div class="u-flex u-cross-center u-gap-4">
            <p class="text">
                <span class="icon-tag u-color-text-success" aria-hidden="true"></span>
                {#if couponData.credits >= 100}
                    {couponData?.code?.toUpperCase()}
                {:else}
                    <span
                        ><Tooltip
                            >Credits applied <span slot="tooltip"
                                >{couponData?.code?.toUpperCase()}</span
                            ></Tooltip
                        ></span>
                {/if}
            </p>
            {#if !fixedCoupon}
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
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            {/if}
        </div>
        {#if couponData.credits >= 100}
            <p class="inline-tag">Credits applied</p>
        {:else}
            <span class="u-color-text-success">-{formatCurrency(couponData.credits)}</span>
        {/if}
    </span>
{/if}
