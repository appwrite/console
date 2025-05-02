import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';
import { RuleType } from '$lib/stores/sdk';
import { DeploymentResourceType } from '$lib/stores/sdk';

export const load: PageLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.DEPLOYMENT);

    const { site } = await parent();

    const [deployment, proxyRuleList] = await Promise.all([
        sdk
            .forProject(params.region, params.project)
            .sites.getDeployment(params.site, params.deployment),
        sdk
            .forProject(params.region, params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('deploymentId', params.deployment),
                Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
                Query.equal('deploymentResourceId', params.site)
            ])
    ]);

    return {
        deployment,
        site,
        proxyRuleList
    };
};
