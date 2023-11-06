import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        view,
        buckets: await sdk.forProject.storage.listBuckets([
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('')
        ])
    };
};
