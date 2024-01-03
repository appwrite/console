import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queryParamToMap, queries } from '$lib/components/filters';
import type { Topic } from '../store';

export const load = async ({ depends, url, route }) => {
    depends(Dependencies.MESSAGING_TOPICS);
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const payload = {
        queries: [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc(''),
            ...parsedQueries.values()
        ]
    };

    if (search) {
        payload['search'] = search;
    }

    // TODO: remove when the API is ready with data
    // This allows us to mock w/ data and when search returns 0 results
    const topics: { topics: Topic[]; total: number } = await sdk.forProject.client.call(
        'GET',
        new URL(sdk.forProject.client.config.endpoint + '/messaging/topics'),
        {
            'X-Appwrite-Project': sdk.forProject.client.config.project,
            'content-type': 'application/json',
            'X-Appwrite-Mode': 'admin'
        },
        payload
    );

    return {
        offset,
        limit,
        search,
        query,
        page,
        topics
    };
};
