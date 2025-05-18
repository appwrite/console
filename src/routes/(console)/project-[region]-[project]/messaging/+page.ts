import { queries, queryParamToMap } from '$lib/components/filters';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
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
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, route, params }) => {
    depends(Dependencies.MESSAGING_MESSAGES);

    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const limit = getLimit(url, route, CARD_LIMIT);
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
        messages: (await sdk
            .forProject(params.region, params.project)
            .messaging.listMessages(
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc(''),
                    ...parsedQueries.values()
                ],
                search || undefined
            )) as {
            total: number;
            messages: (Models.Message & { data: Record<string, string> })[]; // Add typing for message.data
        }
    };
};
