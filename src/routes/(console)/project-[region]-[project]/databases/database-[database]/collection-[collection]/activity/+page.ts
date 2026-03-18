import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { PAGE_LIMIT } from '$lib/constants';
import { Query } from '@appwrite.io/console';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';

export const load: PageLoad = async ({ params, url, route, parent }) => {
    const { database } = await parent();
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    const projectSdk = sdk.forProject(params.region, params.project);
    const logsFn = database.type === 'vectorsdb'
        ? projectSdk.vectorsDB.listCollectionLogs.bind(projectSdk.vectorsDB)
        : projectSdk.documentsDB.listCollectionLogs.bind(projectSdk.documentsDB);

    return {
        offset,
        limit,
        logs: await logsFn({
            databaseId: params.database,
            collectionId: params.collection,
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    };
};
