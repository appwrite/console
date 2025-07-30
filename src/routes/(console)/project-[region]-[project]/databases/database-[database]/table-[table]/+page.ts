import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';
import { buildWildcardColumnsQuery } from './row-[row]/columns/store';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const { table } = await parent();
    depends(Dependencies.ROWS);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
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
            .grids.listRows(params.database, params.table, [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                ...parsedQueries.values(),
                ...buildWildcardColumnsQuery(table)
            ])
    };
};
