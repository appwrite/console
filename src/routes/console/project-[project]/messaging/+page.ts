import { queries, queryParamToMap } from '$lib/components/filters';
import { CARD_LIMIT, PAGE_LIMIT } from '$lib/constants';
import {
    View,
    getLimit,
    getPage,
    getQuery,
    getSearch,
    getView,
    pageToOffset
} from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';

import type { Load } from '@sveltejs/kit';

// checkout messaging/+layout.ts

export const load = async ({ url, route }) => {
    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const qry = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc(''),
        ...parsedQueries.values()
    ];

    const list = await sdk.forProject.messaging.listMessages(qry, search);

    let messages: {
        messages: Models.Message[];
        total: number;
    } = { messages: list.messages, total: list.total };

    return {
        offset,
        limit,
        search,
        query,
        page,
        view,
        messages
    };
};
