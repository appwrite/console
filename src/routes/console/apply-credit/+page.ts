import { base } from '$app/paths';
import type { Coupon } from '$lib/sdk/billing.js';
import { sdk } from '$lib/stores/sdk.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    let couponData: Coupon;
    if (url.searchParams.has('code')) {
        const code = url.searchParams.get('code');
        try {
            couponData = await sdk.forConsole.billing.getCoupon(code);
        } catch (e) {
            redirect(303, `${base}/console`);
        }
    }
    if (!couponData?.campaign) {
        // redirect(303, `${base}/console`);
    }

    return {
        couponData
    };
};
