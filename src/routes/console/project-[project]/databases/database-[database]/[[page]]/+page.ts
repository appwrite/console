import { Query } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
    await parent();
    const page = Number(params.page);
    const offset = pageToOffset(page, CARD_LIMIT);
    const search = url.search.slice(1) ?? undefined;

    return {
        offset,
        search,
        collections: await sdkForProject.databases.listCollections(
            params.database,
            [Query.limit(CARD_LIMIT), Query.offset(offset), Query.orderDesc('$createdAt')],
            search
        )
    };
};
