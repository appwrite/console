import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';

export const load = async ({ url, depends, route, params }) => {
    depends(Dependencies.SITES);
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const view = getView(url, route, View.Grid, View.Grid);

    return {
        offset,
        limit,
        search,
        siteList: await sdk.forProject(params.region, params.project).sites.list({
            queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
            search: search || undefined
        }),
        view
    };
};
