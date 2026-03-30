import type { PageLoad } from './$types';
import { PAGE_LIMIT } from '$lib/constants';
import { Query } from '@appwrite.io/console';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { getCollectionService, type DatabaseType } from '$database/(entity)';

export const load: PageLoad = async ({ params, url, route, parent }) => {
    const { database } = await parent();
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    const collectionSdk = getCollectionService(
        params.region,
        params.project,
        database.type as DatabaseType
    );

    return {
        offset,
        limit,
        logs: await collectionSdk.listCollectionLogs({
            databaseId: params.database,
            collectionId: params.collection,
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    };
};
