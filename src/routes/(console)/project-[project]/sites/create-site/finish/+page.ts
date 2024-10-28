import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    if (!url.searchParams.has('site')) error(404, 'Deployment is not optional');
    const siteId = url.searchParams.get('site');
    const site = await sdk.forProject.sites.get(siteId);
    const deployment = await sdk.forProject.sites.getDeployment(siteId, site.deploymentId);

    return {
        site,
        deployment
    };
};
