import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { error } from '@sveltejs/kit';

export const load = async ({ depends, params }) => {
    depends(Dependencies.SITE);
    try {
        const [site, proxyRuleList] = await Promise.all([
            sdk.forProject.sites.get(params.site),
            sdk.forProject.proxy.listRules([
                Query.equal('resourceType', 'sites'),
                Query.equal('resourceId', params.site),
                Query.limit(1)
            ])
        ]);

        return {
            site,
            proxyRuleList,
            header: Header,
            breadcrumbs: Breadcrumbs
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
