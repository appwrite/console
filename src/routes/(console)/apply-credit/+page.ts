import { resolve } from '$app/paths';
import { sdk } from '$lib/stores/sdk.js';
import { redirect } from '@sveltejs/kit';
import type { Models } from '@appwrite.io/console';

export const load = async ({ url }) => {
    // Has promo code
    if (url.searchParams.has('code')) {
        let couponData: Models.Coupon;
        let campaign: Models.Campaign;
        const code = url.searchParams.get('code');
        try {
            couponData = await sdk.forConsole.billing.getCouponAccount(code);
            if (couponData.campaign) {
                campaign = await sdk.forConsole.billing.getCampaign(couponData.campaign);
            }
            return { couponData, campaign };
        } catch (e) {
            redirect(303, resolve('/'));
        }
    }
    // Has campaign
    else if (url.searchParams.has('campaign')) {
        const campaignId = url.searchParams.get('campaign');
        let campaign: Models.Campaign;
        try {
            campaign = await sdk.forConsole.billing.getCampaign(campaignId);
            return { campaign };
        } catch (e) {
            redirect(303, resolve('/'));
        }
    }
    // No campaign or promo code
    else {
        redirect(303, resolve('/'));
    }
};
