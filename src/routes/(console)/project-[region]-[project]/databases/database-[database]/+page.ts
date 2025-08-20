import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { CARD_LIMIT, Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.TABLES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    const tables = await sdk.forProject(params.region, params.project).grids.listTables({
        databaseId: params.database,
        queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
        search: search || undefined
    });

    return {
        offset,
        limit,
        search,
        view,
        tables
    };
};
