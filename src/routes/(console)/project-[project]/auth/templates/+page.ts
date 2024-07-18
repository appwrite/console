import { sdk } from '$lib/stores/sdk';

export const load = async () => {
    const codes = await sdk.forProject.locale.listCodes();
    return {
        localeCodes: codes.localeCodes
    };
};
