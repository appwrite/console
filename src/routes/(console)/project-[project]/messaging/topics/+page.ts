import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queryParamToMap, queries } from '$lib/components/filters';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, route }) => {
    depends(Dependencies.MESSAGING_TOPICS);
    const page = getPage(url);
    const search = getSearch(url);
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
        topics: await sdk.forProject.messaging.listTopics(
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
