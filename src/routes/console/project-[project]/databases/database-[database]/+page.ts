import { Query } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit') ?? CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        collections: await sdk.forProject.databases.listCollections(params.database, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
