import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load = async ({ params, depends }) => {
    depends(Dependencies.SITE);

    const site = await sdk.forProject.sites.get(params.site);
    const [deployment, proxyRuleList] = await Promise.all([
        sdk.forProject.sites.getDeployment(params.site, site.deploymentId),
        sdk.forProject.proxy.listRules([
            Query.equal('resourceType', 'sites'),
            Query.equal('resourceId', params.site),
            Query.limit(1)
        ])
    ]);
    return {
        site,
        deployment,
        proxyRuleList
    };
};
