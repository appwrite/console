import { Dependencies, SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';
import { buildGridQueries, extractSortFromQueries } from '$database/store';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const { collection } = await parent();
    depends(Dependencies.DOCUMENTS);

    const page = getPage(url);
    const limit = getLimit(url, route, SPREADSHEET_PAGE_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const paramQueries = url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');
    queries.set(parsedQueries);

    const currentSort = extractSortFromQueries(parsedQueries);

    return {
        offset,
        limit,
        view,
        query,
        currentSort,
        parsedQueries,
        documents: await sdk.forProject(params.region, params.project).documentsDB.listDocuments({
            databaseId: params.database,
            collectionId: params.collection,
            queries: buildGridQueries(limit, offset, parsedQueries, collection)
        })
    };
};
