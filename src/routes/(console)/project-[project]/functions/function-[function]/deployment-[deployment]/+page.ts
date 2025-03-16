import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
    const { function: func } = await parent();
    depends(Dependencies.DEPLOYMENT);

    const deployment = await sdk.forProject.functions.getDeployment(
        params.function,
        params.deployment
    );

    return {
        func,
        deployment,
        activeDeployment: func.deploymentId === params.deployment
    };
};
