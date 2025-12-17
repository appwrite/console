import { base } from '$app/paths';
import type { Campaign } from '$lib/stores/campaigns';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    const enableEmail = url.searchParams.has('email_enabled');
    if (url.searchParams.has('code')) {
        const code = url.searchParams.get('code');
        let campaign: Campaign;
        try {
            const couponData = await sdk.forConsole.billing.getCoupon(code);
            if (couponData.campaign) {
                campaign = await sdk.forConsole.billing.getCampaign(couponData.campaign);
                return {
                    enableEmail,
                    couponData,
                    campaign
                };
            } else redirect(303, `${base}/login`);
        } catch (e) {
            redirect(303, `${base}/login`);
        }
    }
    if (url.searchParams.has('campaign')) {
        const campaignId = url.searchParams.get('campaign');
        let campaign: Campaign;
        try {
            campaign = await sdk.forConsole.billing.getCampaign(campaignId);
            return { campaign, enableEmail };
        } catch (e) {
            redirect(303, `${base}/login`);
        }
    }
    return { enableEmail };
};
