import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ url }) => {
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
