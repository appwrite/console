<script lang="ts">
    import { Button, InputText } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Coupon } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let required = false;
    export let coupon: string = '';
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    async function addCoupon() {
        try {
            const response = await sdk.forConsole.account.getCoupon(coupon);
            couponData = response;
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
