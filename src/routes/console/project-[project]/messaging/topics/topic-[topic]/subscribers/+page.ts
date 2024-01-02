import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import type { Target } from '../../../store';
import { queryParamToMap, queries } from '$lib/components/filters/store';

export type Subscriber = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    targetId: string;
    target: Target;
    userName: string;
    topicId: string;
};

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    depends(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);
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

    const { topic } = await parent();

    // TODO: remove when the API is ready with data
    // This allows us to mock w/ data and when search returns 0 results
    const subscribers: { subscribers: Subscriber[]; total: number } =
        await sdk.forProject.client.call(
            'GET',
            new URL(
                `${sdk.forProject.client.config.endpoint}/messaging/topics/${params.topic}/subscribers`
            ),
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
        topic,
        subscribers
    };
};
