import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route, params }) => {
    const page = getPage(url);
    const limit = getLimit(params.project, url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        buckets: await sdk
            .forProject(params.region, params.project)
            .storage.listBuckets([Query.limit(limit), Query.offset(offset), Query.orderDesc('')])
    };
};
