import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: PageLoad = async ({ parent }) => {
    const { mfaRequired } = await parent();
    if (!mfaRequired) {
        redirect(303, base);
    }
    return {
        factors: await sdk.forConsole.account.listMFAFactors()
    };
};
