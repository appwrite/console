import {
    View,
    getLimit,
    getPage,
    getQuery,
    getSearch,
    getView,
    pageToOffset
} from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { messages as data, providersById } from './store';
import type { Message } from './store';
import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { queries, queryParamToMap } from '$lib/components/filters';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    // TODO: remove when the API is ready with data
    // This allows us to mock w/ data and when search returns 0 results
    let messages: { messages: Message[]; total: number } = { messages: [], total: 0 };
    if (search === 'demo') {
        messages = data;
    } else {
        const params = {
            queries: [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                ...parsedQueries.values()
            ]
        };

        if (search) {
            params['search'] = search;
        }

        const response = await sdk.forProject.client.call(
            'GET',
            new URL(sdk.forProject.client.config.endpoint + '/messaging/messages'),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            },
            params
        );

        messages = response;
    }

    return {
        offset,
        limit,
        search,
        query,
        page,
        view,
        messages,
        providersById
    };
};
