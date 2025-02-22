import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { type Models, Query } from '@appwrite.io/console';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITE);
    depends(Dependencies.SITES_DOMAINS);
    const { site, proxyRuleList } = await parent();

    const [deploymentList, prodReadyDeployments] = await Promise.all([
        sdk.forProject.sites.listDeployments(params.site, [Query.limit(4), Query.orderDesc('')]),
        sdk.forProject.sites.listDeployments(params.site, [
            Query.limit(1)
            // Query.equal('status', 'ready')
            // Query.equal('live', true)
        ])
    ]);

    // TODO: @Meldiron check on backend.
    // if the only deployment of the site was deleted, the document isn't updated,
    // and it still refers an old deployment throwing a 404 on overview & deployments page!
    let activeDeployment: Models.Deployment | null;

    try {
        activeDeployment =
            site.deploymentId && deploymentList?.total
                ? await sdk.forProject.sites.getDeployment(params.site, site.deploymentId)
                : null;
    } catch (error) {
        activeDeployment = null;
    }

    return {
        site,
        proxyRuleList,
        deploymentList,
        deployment: activeDeployment,
        hasProdReadyDeployments: prodReadyDeployments?.deployments?.length > 0
    };
};
