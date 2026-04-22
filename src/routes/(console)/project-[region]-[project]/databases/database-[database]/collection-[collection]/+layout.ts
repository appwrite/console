import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { Breadcrumbs, useDatabaseSdk } from '$database/(entity)';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { database } = await parent();
    depends(Dependencies.COLLECTION);

    const databaseSdk = useDatabaseSdk(params.region, params.project, database.type);

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
