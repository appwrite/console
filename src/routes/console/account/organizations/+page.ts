import { Query } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
    const page = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit') ?? CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        organizations: await sdk.forConsole.teams.list([
            Query.offset(offset),
            Query.limit(limit),
            Query.orderDesc('$createdAt')
        ])
    };
};
