import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, route, url }) => {
    depends(Dependencies.KEYS);
    const projectSdk = sdk.forProject(params.region, params.project).project;
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        limit,
        offset,
        keys: await projectSdk.listKeys({
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    };
};
