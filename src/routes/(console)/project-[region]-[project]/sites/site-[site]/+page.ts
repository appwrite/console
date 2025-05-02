import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Query } from '@appwrite.io/console';
import { RuleType } from '$lib/stores/sdk';
import { DeploymentResourceType } from '$lib/stores/sdk';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITE);
    depends(Dependencies.SITES_DOMAINS);
    const { site } = await parent();

    const [deploymentList, prodReadyDeployments, proxyRuleList] = await Promise.all([
        sdk
            .forProject(page.params.region, page.params.project)
            .sites.listDeployments(params.site, [Query.limit(4), Query.orderDesc('')]),
        sdk
            .forProject(page.params.region, page.params.project)
            .sites.listDeployments(params.site, [
                Query.equal('status', 'ready'),
                Query.equal('activate', true),
                Query.orderDesc('')
            ]),
        sdk
            .forProject(page.params.region, page.params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
                Query.equal('deploymentResourceId', site.$id),
                Query.equal('deploymentId', site.deploymentId),
                Query.orderDesc('')
            ])
    ]);

    const deployment = deploymentList?.total
        ? await sdk
              .forProject(page.params.region, page.params.project)
              .sites.getDeployment(params.site, site.deploymentId)
        : null;
    return {
        site,
        deploymentList,
        deployment,
        proxyRuleList,
        prodReadyDeployments,
        hasProdReadyDeployments:
            prodReadyDeployments?.deployments?.filter((d) => d?.$id !== deployment?.$id).length > 0
    };
};
