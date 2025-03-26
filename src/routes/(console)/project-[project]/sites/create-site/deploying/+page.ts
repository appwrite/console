import { DeploymentResourceType, RuleTrigger, RuleType, sdk } from '$lib/stores/sdk';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import { base } from '$app/paths';

export const load: PageLoad = async ({ url, depends, params }) => {
    depends(Dependencies.DEPLOYMENT);
    depends(Dependencies.SITE);
    if (!url.searchParams.has('site')) error(404, 'Site is not optional');
    if (!url.searchParams.has('deployment')) error(404, 'Deployment is not optional');
    const siteId = url.searchParams.get('site');
    const deploymentId = url.searchParams.get('deployment');
    const [site, deployment, proxyRuleList] = await Promise.all([
        sdk.forProject.sites.get(siteId),
        sdk.forProject.sites.getDeployment(siteId, deploymentId),
        sdk.forProject.proxy.listRules([
            Query.equal('type', RuleType.DEPLOYMENT),
            Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
            Query.equal('deploymentResourceId', siteId),
            Query.equal('deploymentId', deploymentId),
            Query.equal('trigger', RuleTrigger.MANUAL)
        ])
    ]);

    if (deployment?.status === 'ready' && site?.deploymentId === deploymentId) {
        redirect(
            303,
            `${base}/project-${params.project}/sites/create-site/finish?site=${site.$id}`
        );
    }

    return {
        site,
        deployment,
        proxyRuleList,
        repository: site?.installationId
            ? await sdk.forProject.vcs.getRepository(site.installationId, site.providerRepositoryId)
            : undefined
    };
};
