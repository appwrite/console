import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.DEPLOYMENT);

    const { site, proxyRuleList } = await parent();

    const [deployment] = await Promise.all([
        sdk.forProject.sites.getDeployment(params.site, params.deployment)
    ]);

    return {
        deployment,
        site,
        proxyRuleList
    };
};
