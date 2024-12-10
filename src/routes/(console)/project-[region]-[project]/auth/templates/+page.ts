import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const codes = await sdk.forProject(params.region, params.project).locale.listCodes();
    return {
        localeCodes: codes.localeCodes
    };
};
