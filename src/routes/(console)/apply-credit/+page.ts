import { base } from '$app/paths';
import type { Coupon } from '$lib/sdk/billing.js';
import { campaigns } from '$lib/stores/campaigns.js';
import { sdk } from '$lib/stores/sdk.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    // Has promo code
    if (url.searchParams.has('code')) {
        let couponData: Coupon;
        const code = url.searchParams.get('code');
        try {
            couponData = await sdk.forConsole.billing.getCoupon(code);
        } catch (e) {
            redirect(303, base);
        }
        if (!couponData?.campaign || !campaigns.has(couponData.campaign)) {
            redirect(303, base);
        } else {
            return {
                couponData,
                campaign: couponData.campaign
            };
        }
    }
    // Has campaign
    else if (url.searchParams.has('campaign')) {
        const campaign = url.searchParams.get('campaign');
        if (campaigns.has(campaign)) {
            return {
                campaign
            };
        } else {
            redirect(303, base);
        }
    }
    // No campaign or promo code
    else {
        redirect(303, base);
    }
};
