import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import {
    View,
    getLimit,
    getPage,
    getQuery,
    getSearch,
    getView,
    pageToOffset
} from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { providersById, type Provider } from '../store';
import { queries, queryParamToMap } from '$lib/components/filters/store';

const providers = Object.values(providersById);

let data: { providers: Provider[]; total: number } = {
    providers: [...providers],
    total: providers.length
};

export const load = async ({ depends, url, route }) => {
    depends(Dependencies.MESSAGING_PROVIDERS);

    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    // TODO: get rid of demo data
    let providers: { providers: Provider[]; total: number } = { providers: [], total: 0 };
    if (search == 'demo') {
        providers = data;
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
            new URL(sdk.forProject.client.config.endpoint + '/messaging/providers'),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            },
            params
        );

        providers = response;
    }

    return {
        offset,
        limit,
        search,
        query,
        page,
        view,
        providers
    };
};
