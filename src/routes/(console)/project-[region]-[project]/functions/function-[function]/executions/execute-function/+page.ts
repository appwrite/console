import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
    const data = await parent();
    depends(Dependencies.DEPLOYMENTS);

    return {
        func: data.function,
        activeDeployment: data.function.deployment
            ? await sdk
                  .forProject(params.region, params.project)
                  .functions.getDeployment(params.function, data.function.deployment)
            : null
    };
};
