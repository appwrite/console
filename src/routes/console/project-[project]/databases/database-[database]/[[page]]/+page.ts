import { Query } from '@aw-labs/appwrite-console';
import { sdk, sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const page = Number(params.page);
    const offset = pageToOffset(page, CARD_LIMIT);

    return {
        offset,
        collections: await sdkForProject().databases.listCollections(params.database, [
            Query.limit(CARD_LIMIT),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
