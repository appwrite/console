import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DEPLOYMENT);

    return {
        deployment: await sdk.forProject.functions.getDeployment(params.function, params.deployment)
    };
};
