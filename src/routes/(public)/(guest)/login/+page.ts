import { resolve } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Models } from '@appwrite.io/console';

export const load: PageLoad = async ({ url }) => {
    if (url.searchParams.has('code')) {
        const code = url.searchParams.get('code');
        let campaign: Models.Campaign;
        try {
            const couponData = await sdk.forConsole.billing.getCoupon(code);
            if (couponData.campaign) {
                campaign = await sdk.forConsole.billing.getCampaign(couponData.campaign);
                return {
                    couponData,
                    campaign
                };
            } else redirect(303, resolve('/login'));
        } catch (e) {
            redirect(303, resolve('/login'));
        }
    }
    if (url.searchParams.has('campaign')) {
        const campaignId = url.searchParams.get('campaign');
        let campaign: Models.Campaign;
        try {
            campaign = await sdk.forConsole.billing.getCampaign(campaignId);
            return { campaign };
        } catch (e) {
            redirect(303, resolve('/login'));
        }
    }
    return;
};
