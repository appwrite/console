import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, params, route, url }) => {
    depends(Dependencies.PROJECT);
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        limit,
        offset,
        platforms: await sdk.forProject(params.region, params.project).project.listPlatforms({
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    };
};
