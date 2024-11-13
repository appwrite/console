import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DEPLOYMENT);

    const deployment = await sdk.forProject.sites.getDeployment(params.site, params.deployment);

    return {
        deployment
    };
};
