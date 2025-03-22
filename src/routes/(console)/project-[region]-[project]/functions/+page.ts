import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, depends, route, params }) => {
    depends(Dependencies.FUNCTIONS);

    const page = getPage(url);
    const limit = getLimit(params.project, url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        functions: await sdk
            .forProject(params.region, params.project)
            .functions.list([Query.limit(limit), Query.offset(offset), Query.orderDesc('')])
    };
};
