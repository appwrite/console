import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITE);

    const { site, proxyRuleList } = await parent();

    const [deployment] = await Promise.all([
        sdk.forProject.sites.getDeployment(params.site, site.deploymentId)
    ]);
    return {
        site,
        deployment,
        proxyRuleList
    };
};
