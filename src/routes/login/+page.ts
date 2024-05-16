import type { Coupon } from '$lib/sdk/billing.js';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ url }) => {
    let couponData: Coupon;
    if (url.searchParams.has('code')) {
        const code = url.searchParams.get('code');
        couponData = await sdk.forConsole.billing.getCoupon(code);
    }

    return {
        couponData
    };
};
