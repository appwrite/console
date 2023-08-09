import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { CARD_LIMIT } from '$lib/constants';

export const load: PageLoad = async ({ params, url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        view,
        collections: await sdk.forProject.databases.listCollections(params.database, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('')
        ])
    };
};
