<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Models } from '@appwrite.io/console';

    export let couponData: Partial<Models.Coupon> = {
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
                <span class="icon-tag u-color-text-success" aria-hidden="true" />
                {#if couponData.credits >= 100}
                    {couponData?.code?.toUpperCase()}
                {:else}
                    <span use:tooltip={{ content: couponData?.code?.toUpperCase() }}>
                        Credits applied
                    </span>
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
                    <span class="icon-x" aria-hidden="true" />
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
