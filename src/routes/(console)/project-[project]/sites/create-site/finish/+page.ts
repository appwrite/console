import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';

export const load = async ({ url, depends }) => {
    depends(Dependencies.SITE);
    if (!url.searchParams.has('site')) error(404, 'Deployment is not optional');
    const siteId = url.searchParams.get('site');
    const [site, proxyRuleList] = await Promise.all([
        sdk.forProject.sites.get(siteId),
        sdk.forProject.proxy.listRules([
            Query.equal('resourceId', siteId),
            Query.equal('resourceType', 'site')
        ])
    ]);
    return {
        site,
        deployment: await sdk.forProject.sites.getDeployment(siteId, site.deploymentId),
        proxyRuleList
    };
};
