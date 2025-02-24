import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    if (!url.searchParams.has('site')) error(404, 'Site is not optional');
    if (!url.searchParams.has('deployment')) error(404, 'Deployment is not optional');
    const siteId = url.searchParams.get('site');
    const deploymentId = url.searchParams.get('deployment');
    const [site, deployment] = await Promise.all([
        sdk.forProject.sites.get(siteId),
        sdk.forProject.sites.getDeployment(siteId, deploymentId)
    ]);

    return {
        site,
        deployment,
        repository: site?.installationId
            ? await sdk.forProject.vcs.getRepository(site.installationId, site.providerRepositoryId)
            : undefined
    };
};
