import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    const payload = {
        queries: [Query.limit(limit), Query.offset(offset)]
    };

    // TODO: remove when the API is ready with data
    // This allows us to mock w/ data and when search returns 0 results
    const logs: Models.LogList = await sdk.forProject.client.call(
        'GET',
        new URL(`${sdk.forProject.client.config.endpoint}/messaging/topics/${params.topic}/logs`),
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
        logs
    };
};
