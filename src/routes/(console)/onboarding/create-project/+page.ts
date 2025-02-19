import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async () => {
    return {
        regions: isCloud ? await sdk.forConsole.billing.listRegions() : null
    };
};
