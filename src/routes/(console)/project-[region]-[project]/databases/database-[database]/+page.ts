import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { type DatabaseType, type EntityList, toSupportiveEntity } from '$database/(entity)';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { database } = await parent();
    depends(Dependencies.TABLES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    let entities: EntityList;
    const databaseType = database.type as DatabaseType;

    const searchQuery = search || undefined;
    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('')];

    const projectSdk = sdk.forProject(params.region, params.project);
    const methodParams = {
        queries,
        databaseId: params.database,
        ...(searchQuery && { search: searchQuery })
    };

    switch (databaseType) {
        case 'tablesdb': {
            const { total, tables } = await projectSdk.tablesDB.listTables(methodParams);
            entities = { total, entities: tables.map(toSupportiveEntity) };
            break;
        }

        case 'documentsdb': {
            const { total, collections } =
                await projectSdk.documentsDB.listCollections(methodParams);
            entities = { total, entities: collections.map(toSupportiveEntity) };
            break;
        }
    }

    return {
        offset,
        limit,
        search,
        view,
        entities
    };
};
