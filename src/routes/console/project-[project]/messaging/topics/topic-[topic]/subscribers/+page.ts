import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { queryParamToMap, queries } from '$lib/components/filters';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    return {
        offset,
        limit,
        search,
        query,
        subscribers: await sdk.forProject.messaging.listSubscribers(
            params.topic,
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
