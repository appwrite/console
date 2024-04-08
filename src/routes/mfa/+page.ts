import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async () => {
    return {
        factors: await sdk.forConsole.account.listMfaFactors()
    };
};
