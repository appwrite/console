import { Dependencies, SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';
import { buildGridQueries, extractSortFromQueries, loadGridRows } from '$database/store';
import { getCollectionService } from '$database/(entity)';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const { collection, database } = await parent();
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
    const collectionSdk = getCollectionService(params.region, params.project, database.type);

    const documentsPage = await loadGridRows(
        collection,
        (includeRelationships) =>
            buildGridQueries(limit, offset, parsedQueries, collection, includeRelationships),
        async (queries) => {
            const response = await collectionSdk.listDocuments({
                databaseId: params.database,
                collectionId: params.collection,
                queries
            });

            return { total: response.total, rows: response.documents };
        }
    );

    return {
        offset,
        limit,
        view,
        query,
        currentSort,
        parsedQueries,
        documents: { total: documentsPage.total, documents: documentsPage.rows }
    };
};
