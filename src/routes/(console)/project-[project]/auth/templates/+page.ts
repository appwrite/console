import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    const codes = await sdk.forProject.locale.listCodes();
    return {
        localeCodes: codes.localeCodes
    };
};
