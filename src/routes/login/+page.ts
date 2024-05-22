import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    if (url.searchParams.has('code')) {
        const code = url.searchParams.get('code');
        try {
            const couponData = await sdk.forConsole.billing.getCoupon(code);
            return {
                couponData
            };
        } catch (e) {
            redirect(303, `${base}/login`);
        }
    }
    return;
};
