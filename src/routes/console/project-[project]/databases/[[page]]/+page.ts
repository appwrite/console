import { CARD_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdk, sdkForProject } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const page = Number(params.page);
    const offset = pageToOffset(page, CARD_LIMIT);

    return {
        offset,
        databases: await sdkForProject().databases.list([
            Query.limit(CARD_LIMIT),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
