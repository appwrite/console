import { base } from '$app/paths';
import type { Coupon } from '$lib/sdk/billing.js';
import { sdk } from '$lib/stores/sdk.js';
import type { Models } from '@appwrite.io/console';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    // Has promo code
    if (url.searchParams.has('code')) {
        let couponData: Coupon;
        let campaign: Models.Campaign;
        const code = url.searchParams.get('code');
        try {
            couponData = await sdk.forConsole.account.getCoupon(code);
            if (couponData.campaign) {
                campaign = await sdk.forConsole.console.getCampaign(couponData.campaign);
            }
            return { couponData, campaign };
        } catch (e) {
            redirect(303, base);
        }
    }
    // Has campaign
    else if (url.searchParams.has('campaign')) {
        const campaignId = url.searchParams.get('campaign');
        let campaign: Models.Campaign;
        try {
            campaign = await sdk.forConsole.console.getCampaign(campaignId);
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
