import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { Breadcrumbs, toDatabaseType, useDatabaseSdk } from '$database/(entity)';
import { redirect } from '@sveltejs/kit';
import { resolveRoute } from '$lib/stores/navigation';

export const load: LayoutLoad = async ({ params, depends, parent, url }) => {
    const { database } = await parent();
    const type = toDatabaseType(database.type);

    if (type === 'legacy' || type === 'tablesdb') {
        const collectionPath = resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]',
            params
        );
        const tablePath = resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]/table-[table]',
            { ...params, table: params.collection }
        );

        redirect(308, tablePath + url.pathname.slice(collectionPath.length) + url.search);
    }

    depends(Dependencies.COLLECTION);

    const databaseSdk = useDatabaseSdk(params.region, params.project, type);

    const collection = await databaseSdk.getEntity({
        databaseId: params.database,
        entityId: params.collection
    });

    return {
        collection,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
