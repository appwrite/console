import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FUNCTION);
    depends(Dependencies.DEPLOYMENTS);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            function: sdk.forProject.functions.get(params.function),
            proxyRuleList: sdk.forProject.proxy.listRules([
                Query.equal('resourceType', 'function'),
                Query.equal('resourceId', params.function),
                Query.limit(1)
            ])
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
