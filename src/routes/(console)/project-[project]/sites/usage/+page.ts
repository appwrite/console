import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load = async ({ depends }) => {
    depends(Dependencies.SITES);

    const usage = await sdk.forProject.sites.listUsage();

    return {
        usage
    };
};
