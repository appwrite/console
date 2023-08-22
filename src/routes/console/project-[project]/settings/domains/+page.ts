import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { ProxyTypes } from '$lib/pages/domains/index.svelte';

export const load: PageLoad = async ({ depends, url }) => {
    depends(Dependencies.DOMAINS);

    return {
        rules: await sdk.forProject.proxy.listRules([Query.equal('resourceType', ProxyTypes.API)]),
        create: url.searchParams.get('create') !== null
    };
};
