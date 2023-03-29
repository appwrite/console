import { CARD_LIMIT } from '$lib/constants';
import { getLimit, getOrder, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);
    const order = getOrder(url, '$createdAt');

    return {
        offset,
        limit,
        view,
        order,
        databases: await sdk.forProject.databases.list([
            Query.limit(limit),
            Query.offset(offset),
            order.query
        ])
    };
};
