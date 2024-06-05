import { base } from '$app/paths';
import { campaigns } from '$lib/stores/campaigns';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    if (url.searchParams.has('code')) {
        const code = url.searchParams.get('code');
        try {
            const couponData = await sdk.forConsole.billing.getCoupon(code);
            if (couponData?.campaign && campaigns.has(couponData.campaign)) {
                return {
                    couponData
                };
            } else redirect(303, `${base}/login`);
        } catch (e) {
            redirect(303, `${base}/login`);
        }
    }
    return;
};
