import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { queries, queryParamToMap } from '$lib/components/filters/store';

export async function load({ params, depends, url, route, parent }) {
    await parent();
    depends(Dependencies.DOCUMENTS);
    depends(Dependencies.COLLECTION);

    const navigationPage = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(navigationPage, limit);
    const query = getQuery(url);

    const paramQueries = url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');
    queries.set(parsedQueries);

    return {
        offset,
        limit,
        view,
        query,
        collection: await sdk.forProject.databases.getCollection(
            params.database,
            params.collection
        ),
        documents: await sdk.forProject.databases.listDocuments(
            params.database,
            params.collection,
            [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                ...parsedQueries.values()
            ]
        )
    };
}
