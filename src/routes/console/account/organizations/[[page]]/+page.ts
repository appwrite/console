import { Query } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const page = Number(params.page);
    const offset = pageToOffset(page, CARD_LIMIT);

    return {
        offset,
        organizations: await sdk.forConsole.teams.list([
            Query.offset(offset),
            Query.limit(CARD_LIMIT),
            Query.orderDesc('$createdAt')
        ])
    };
};
