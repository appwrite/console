import { Dependencies } from '$lib/constants';
import { RuleType, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.FUNCTION_DOMAINS);

    return {
        rules: await sdk.forProject.proxy.listRules([
            Query.equal('type', RuleType.DEPLOYMENT),
            Query.equal('automantion', `function=${params.function}`)
        ])
    };
};
