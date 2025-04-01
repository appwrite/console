import { base } from '$app/paths';
import type { Coupon } from '$lib/sdk/billing.js';
import type { Campaign } from '$lib/stores/campaigns.js';
import { sdk } from '$lib/stores/sdk.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    // Has promo code
    if (url.searchParams.has('code')) {
        let couponData: Coupon;
        let campaign: Campaign;
        const code = url.searchParams.get('code');
        try {
            couponData = await sdk.forConsole.billing.getCouponAccount(code);
            if (couponData.campaign) {
                campaign = await sdk.forConsole.billing.getCampaign(couponData.campaign);
            }
            return { couponData, campaign };
        } catch (e) {
            redirect(303, base);
        }
    }
    // Has campaign
    else if (url.searchParams.has('campaign')) {
        const campaignId = url.searchParams.get('campaign');
        let campaign: Campaign;
        try {
            campaign = await sdk.forConsole.billing.getCampaign(campaignId);
            return { campaign };
        } catch (e) {
            redirect(303, base);
        }
    }
    // No campaign or promo code
    else {
        redirect(303, base);
    }
};
