import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
    const { function: func } = await parent();
    depends(Dependencies.DEPLOYMENT);

    const deployment = await sdk
        .forProject(params.region, params.project)
        .functions.getDeployment(params.function, params.deployment);

    return {
        deployment,
        activeDeployment: func.deployment === params.deployment
    };
};
