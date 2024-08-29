import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query, ResourceType } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url }) => {
    depends(Dependencies.DOMAINS);

    return {
        rules: await sdk.forProject.proxy.listRules([
            Query.equal('resourceType', ResourceType.Api)
        ]),
        create: url.searchParams.get('create') !== null
    };
};
