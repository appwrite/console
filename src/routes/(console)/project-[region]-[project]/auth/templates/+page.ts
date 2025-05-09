import { sdk } from '$lib/stores/sdk';

export const load = async ({ params }) => {
    const codes = await sdk.forProject(params.region, params.project).locale.listCodes();
    return {
        localeCodes: codes.localeCodes
    };
};
