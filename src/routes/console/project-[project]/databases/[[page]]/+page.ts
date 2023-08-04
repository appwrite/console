import { CARD_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const page = Number(params.page);
    const offset = pageToOffset(page, CARD_LIMIT);

    return {
        offset,
        databases: await sdk.forProject.databases.list([
            Query.limit(CARD_LIMIT),
            Query.offset(offset)
        ])
    };
};
