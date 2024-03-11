import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query, ResourceType } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.FUNCTION_DOMAINS);

    return {
        rules: await sdk.forProject.proxy.listRules([
            Query.equal('resourceType', ResourceType.Function),
            Query.equal('resourceId', params.function)
        ])
    };
};
