<script lang="ts">
    import { CouponInput } from '$lib/components/billing';
    import { WizardStep } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { addCreditWizardStore } from '../store';

    let coupon: string;
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    async function validateCoupon() {
        if (couponData?.status === 'active') return;
        try {
            const response = await sdk.forConsole.billing.getCoupon(coupon);
            couponData = response;
            coupon = null;
        } catch (error) {
            console.log('test');
            couponData.code = coupon;
            couponData.status = 'error';
            $wizard.interceptorNotificationEnabled = false;
            throw new Error(error);
        }
    }
</script>

<WizardStep beforeSubmit={validateCoupon}>
    <svelte:fragment slot="title">Add credits</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Add Appwrite credits to your organization. A payment method is required before credits can
        be applied.
    </svelte:fragment>
    <CouponInput
        bind:coupon
        bind:couponData
        on:validation={(e) => {
            $addCreditWizardStore.coupon = e.detail.code;
        }}
        let:data>
        <span>{data.code} has been successfully added</span>
    </CouponInput>
</WizardStep>
