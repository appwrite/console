import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.DEPLOYMENT);

    const { site } = await parent();

    const [deployment, proxyRuleList] = await Promise.all([
        sdk.forProject.sites.getDeployment(params.site, params.deployment),
        sdk.forProject.proxy.listRules([
            Query.equal('resourceId', params.deployment),
            Query.equal('resourceType', 'deployment')
        ])
    ]);

    return {
        deployment,
        site,
        proxyRuleList
    };
};
