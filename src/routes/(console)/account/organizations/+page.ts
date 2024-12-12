import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route }) => {
    const page = getPage(url);
    const limit = getLimit('console', url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        organizations: await sdk.forConsole.teams.list([
            Query.offset(offset),
            Query.limit(limit),
            Query.orderDesc('')
        ])
    };
};
