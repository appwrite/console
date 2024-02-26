import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { LayoutLoad } from './$types';

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

// I **think** this should be enough, tbh
const loadProviders = async ({ url, route }: Parameters<Load>[0]) => {
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);
    const search = getSearch(url);

    return sdk.forProject.messaging.listProviders(
        [Query.limit(10), Query.offset(offset), Query.orderDesc(''), ...parsedQueries.values()],
        search || undefined
    );
};

export const load: LayoutLoad = async (params) => {
    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        providers: loadProviders(params)
    };
};
