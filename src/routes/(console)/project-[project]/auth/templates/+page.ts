import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent }) => {
    const { project } = await parent();
    const codes = await sdk.forProject.locale.listCodes();
    return {
        project,
        localeCodes: codes.localeCodes
    };
};
