import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITE);
    depends(Dependencies.SITES_DOMAINS);
    const { site, proxyRuleList } = await parent();

    const [deployment, deploymentList] = await Promise.all([
        sdk.forProject.sites.getDeployment(params.site, site.deploymentId),
        sdk.forProject.sites.listDeployments(params.site, [Query.limit(5), Query.orderDesc('')])
    ]);
    return {
        site,
        deployment,
        deploymentList,
        proxyRuleList
    };
};
