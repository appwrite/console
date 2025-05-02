import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import {
    View,
    getLimit,
    getPage,
    getQuery,
    getSearch,
    getView,
    pageToOffset
} from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queries, queryParamToMap } from '$lib/components/filters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, route, params }) => {
    depends(Dependencies.MESSAGING_PROVIDERS);

    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(params.project, url, route, View.Grid);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    return {
        offset,
        limit,
        search,
        query,
        page,
        view,
        providers: await sdk
            .forProject(params.region, params.project)
            .messaging.listProviders(
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc(''),
                    ...parsedQueries.values()
                ],
                search || undefined
            )
    };
};
