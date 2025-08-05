import { Dependencies /*PAGE_LIMIT*/ } from '$lib/constants';
import { getLimit, getPage, getQuery, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { type Models, Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';
import { buildWildcardColumnsQuery } from './row-[row]/columns/store';
import type { TagValue } from '$lib/components/filters/store';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const { table } = await parent();
    depends(Dependencies.ROW); /* TODO: we could just invalidate the rows maybe? */
    depends(Dependencies.ROWS);

    const page = getPage(url);
    // TODO: apply pagination
    const limit = getLimit(url, route, 96 /*PAGE_LIMIT*/);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const paramQueries = url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');
    queries.set(parsedQueries);

    return {
        offset,
        limit,
        view,
        query,
        rows: await sdk
            .forProject(params.region, params.project)
            .grids.listRows(
                params.database,
                params.table,
                buildGridQueries(limit, offset, parsedQueries, table)
            )
    };
};

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
