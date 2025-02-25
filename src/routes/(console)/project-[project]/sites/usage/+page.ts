import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITES);

    const usage = await sdk.forProject.sites.listUsage();

    return {
        usage
    };
};
