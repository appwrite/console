import { CARD_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit') ?? CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        databases: await sdk.forProject.databases.list([
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
