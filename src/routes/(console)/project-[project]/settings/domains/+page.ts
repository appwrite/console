import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { getSearch } from '$lib/helpers/load';
import { RuleType } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends, url }) => {
    depends(Dependencies.DOMAINS);

    const search = getSearch(url);

    return {
        search,
        rules: await sdk.forProject.proxy.listRules(
            [Query.equal('type', RuleType.API)],
            search || undefined
        ),
        create: url.searchParams.get('create') !== null
    };
};
