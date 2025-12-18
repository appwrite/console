<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { Button, InputText } from '$lib/elements/forms';

    const dispatch = createEventDispatcher();

    export let required = false;
    export let coupon: string = '';
    export let couponData: Partial<Models.Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    async function addCoupon() {
        try {
            couponData = await sdk.forConsole.billing.getCouponAccount(coupon);
            dispatch('validation', couponData);
            coupon = null;
        } catch (error) {
            couponData.code = coupon;
            couponData.status = 'error';
        }
    }

    function removeCoupon() {
        couponData = {
            code: null,
            status: null,
            credits: null
        };
    }
</script>

<Layout.Stack direction="row" gap="s" wrap="wrap" alignItems="center">
    <InputText
        placeholder="Coupon code"
        id="code"
        label="Add credits"
        {required}
        disabled={couponData?.status === 'active'}
        bind:value={coupon}>
    </InputText>
    <Button secondary disabled={couponData?.status === 'active' || !coupon} on:click={addCoupon}>
        Apply
    </Button>
</Layout.Stack>
{#if couponData?.status === 'error'}
    <div>
        <span class="icon-exclamation-circle u-color-text-danger"></span>
        <span>
            {couponData.code.toUpperCase()} is not a valid promo code
        </span>
    </div>
{:else if couponData?.status === 'active'}
    <div class="u-flex u-main-space-between u-cross-center">
        <div>
            <span class="icon-tag u-color-text-success"></span>
            <slot data={couponData}>
                <span>
                    {couponData.code.toUpperCase()} applied (-{formatCurrency(couponData.credits)})
                </span>
            </slot>
        </div>
        <Button icon text on:click={removeCoupon}><span class="icon-x"></span></Button>
    </div>
{/if}
