import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query, ResourceType } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { getSearch } from '$lib/helpers/load';

export const load: PageLoad = async ({ depends, url }) => {
    depends(Dependencies.DOMAINS);

    const search = getSearch(url);

    return {
        search,
        rules: await sdk.forProject.proxy.listRules(
            [Query.equal('resourceType', [ResourceType.Site, ResourceType.Api])],
            search || undefined
        ),
        create: url.searchParams.get('create') !== null
    };
};
