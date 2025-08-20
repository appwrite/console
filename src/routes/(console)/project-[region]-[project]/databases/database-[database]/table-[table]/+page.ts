import { Dependencies, SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { type Models, Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';
import { buildWildcardColumnsQuery } from './rows/store';
import type { TagValue } from '$lib/components/filters/store';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const { table } = await parent();
    depends(Dependencies.ROW); /* TODO: we could just invalidate the rows maybe? */
    depends(Dependencies.ROWS);

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
        rows: await sdk.forProject(params.region, params.project).grids.listRows({
            databaseId: params.database,
            tableId: params.table,
            queries: buildGridQueries(limit, offset, parsedQueries, table)
        })
    };
};

function extractSortFromQueries(parsedQueries: Map<TagValue, string>) {
    for (const [tagValue, queryString] of parsedQueries.entries()) {
        if (queryString.includes('orderAsc') || queryString.includes('orderDesc')) {
            const isAsc = queryString.includes('orderAsc');
            return {
                column: tagValue.value,
                direction: isAsc ? 'asc' : 'desc'
            };
        }
    }

    return { column: null, direction: 'default' };
}

function buildGridQueries(
    limit: number,
    offset: number,
    parsedQueries: Map<TagValue, string>,
    table: Models.Table
) {
    const hasOrderQuery = Array.from(parsedQueries.values()).some(
        (q) => q.includes('orderAsc') || q.includes('orderDesc')
    );

    const queryArray = [Query.limit(limit), Query.offset(offset)];

    // don't override if there's a user created sort!
    if (!hasOrderQuery) {
        queryArray.push(Query.orderDesc(''));
    }

    queryArray.push(...parsedQueries.values(), ...buildWildcardColumnsQuery(table));

    return queryArray;
}
