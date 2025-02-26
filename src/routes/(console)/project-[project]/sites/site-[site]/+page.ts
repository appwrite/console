import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITE);
    depends(Dependencies.SITES_DOMAINS);
    const { site } = await parent();

    const [deploymentList, prodReadyDeployments, proxyRuleList] = await Promise.all([
        sdk.forProject.sites.listDeployments(params.site, [Query.limit(4), Query.orderDesc('')]),

        sdk.forProject.sites.listDeployments(params.site, [
            Query.limit(1)
            // Query.equal('status', 'ready')
            // Query.equal('live', true)
        ]),
        sdk.forProject.proxy.listRules([
            Query.equal('resourceType', 'site'),
            Query.equal('resourceId', params.site),
            Query.orderDesc('')
        ])
    ]);
    return {
        site,
        deploymentList,
        deployment: deploymentList?.total
            ? await sdk.forProject.sites.getDeployment(params.site, site.deploymentId)
            : null,
        proxyRuleList,
        hasProdReadyDeployments: prodReadyDeployments?.deployments?.length > 0
    };
};
