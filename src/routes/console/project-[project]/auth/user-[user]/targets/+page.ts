import { queries, queryParamToMap } from '$lib/components/filters';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.USER_TARGETS);
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

    // TODO: remove when the API is ready with data
    // This allows us to mock w/ data and when search returns 0 results
    const targets: { targets: Models.Target[]; total: number } = await sdk.forProject.client.call(
        'GET',
        new URL(`${sdk.forProject.client.config.endpoint}/users/${params.user}/targets`),
        {
            'X-Appwrite-Project': sdk.forProject.client.config.project,
            'content-type': 'application/json',
            'X-Appwrite-Mode': 'admin'
        },
        payload
    );

    const promisesById: Record<string, Promise<Models.Provider>> = {};
    targets.targets.forEach((target) => {
        if (target.providerId && !promisesById[target.providerId]) {
            promisesById[target.providerId] = sdk.forProject.client.call(
                'GET',
                new URL(
                    `${sdk.forProject.client.config.endpoint}/messaging/providers/${target.providerId}`
                ),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                }
            );
        }
    });

    const providersById: Record<string, Models.Provider> = {};
    const resolved = await Promise.allSettled(Object.values(promisesById));
    resolved.forEach((result) => {
        if (result.status === 'fulfilled') {
            const provider = result.value;
            providersById[provider.$id] = provider;
        }
    });

    return {
        offset,
        limit,
        search,
        query,
        targets,
        providersById
    };
};
