import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route, params }) => {
    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const buckets = await sdk.forProject(params.region, params.project).storage.listBuckets({
        queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
        search: search || undefined
    });

    return {
        offset,
        limit,
        view,
        search,
        buckets
    };
};
