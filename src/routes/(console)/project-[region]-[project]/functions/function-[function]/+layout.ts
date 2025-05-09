import { DeploymentResourceType, sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';
import { Query } from '@appwrite.io/console';
import { RuleType } from '$lib/stores/sdk';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FUNCTION);
    depends(Dependencies.DEPLOYMENTS);

    try {
        const func = await sdk
            .forProject(params.region, params.project)
            .functions.get(params.function);

        //TODO remove rule limit of 1 and display extra rules
        const proxyRuleList = await sdk
            .forProject(params.region, params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('deploymentResourceType', DeploymentResourceType.FUNCTION),
                Query.equal('deploymentResourceId', params.function),
                Query.equal('deploymentId', func.deploymentId),
                Query.limit(1)
            ]);

        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            function: func,
            proxyRuleList
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
