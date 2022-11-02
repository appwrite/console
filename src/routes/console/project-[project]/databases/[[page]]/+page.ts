import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const page = Number(params.page);
    const offset = pageToOffset(page, CARD_LIMIT);

    return {
        offset,
        databases: await sdkForProject.databases.list([
            Query.limit(CARD_LIMIT),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
