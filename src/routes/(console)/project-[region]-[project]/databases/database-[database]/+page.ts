import { Query } from '@appwrite.io/console';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { type DatabaseType, useDatabaseSdk } from '$database/(entity)';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { database, dedicatedDatabase, credentials } = await parent();
    depends(Dependencies.TABLES);

    const databaseType = database.type as DatabaseType;

    // For dedicated databases, we don't fetch entities (tables/collections)
    const isDedicatedType = databaseType === 'prismapostgres' || databaseType === 'dedicateddb';

    if (isDedicatedType) {
        return {
            offset: 0,
            limit: 0,
            search: '',
            view: View.Grid,
            entities: { total: 0, entities: [] },
            isDedicatedType: true,
            dedicatedDatabase,
            credentials
        };
    }

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    const databaseSdk = useDatabaseSdk(params.region, params.project, databaseType);
    const entities = await databaseSdk.listEntities({
        databaseId: database.$id,
        search: search || undefined,
        queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('')]
    });

    return {
        offset,
        limit,
        search,
        view,
        entities,
        isDedicatedType: false,
        dedicatedDatabase: null,
        credentials: null
    };
};
