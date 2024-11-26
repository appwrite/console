import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';

export const load = async ({ url, depends }) => {
    depends(Dependencies.SITE);
    if (!url.searchParams.has('site')) error(404, 'Deployment is not optional');
    const siteId = url.searchParams.get('site');
    const site = await sdk.forProject.sites.get(siteId);
    const deployment = await sdk.forProject.sites.getDeployment(siteId, site.deploymentId);
    const { rules } = await sdk.forProject.proxy.listRules([
        Query.equal('resourceId', site.$id),
        Query.equal('resourceType', 'site'),
        Query.limit(1)
    ]);
    return {
        site,
        deployment,
        rule: rules[0]
    };
};
