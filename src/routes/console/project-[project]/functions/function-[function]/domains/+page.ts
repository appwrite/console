import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { ProxyTypes } from '$lib/pages/domains/index.svelte';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.FUNCTION_DOMAINS);

    return {
        rules: await sdk.forProject.proxy.listRules([
            Query.equal('resourceType', ProxyTypes.FUNCTION),
            Query.equal('resourceId', params.function)
        ])
    };
};
