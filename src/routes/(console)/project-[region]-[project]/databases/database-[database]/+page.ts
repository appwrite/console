import { Query } from '@appwrite.io/console';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { type DatabaseType, useDatabasesSdk } from '$database/(entity)';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { database } = await parent();
    depends(Dependencies.TABLES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    const databaseType = database.type as DatabaseType;

    const databasesSdk = useDatabasesSdk(params.region, params.project, databaseType);
    const entities = await databasesSdk.listEntities({
        databaseId: database.$id,
        search: search || undefined,
        queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')]
    });

    return {
        offset,
        limit,
        search,
        view,
        entities
    };
};
