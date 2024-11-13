import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.SITE);
    depends(Dependencies.DEPLOYMENTS);

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
            proxyRuleList
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
