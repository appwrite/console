import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { Breadcrumbs, useDatabasesSdk } from '$database/(entity)';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { database } = await parent();
    depends(Dependencies.TABLE);

    const databasesSdk = useDatabasesSdk(params.region, params.project, database.type);

    const table = await databasesSdk.getEntity({
        databaseId: params.database,
        entityId: params.table
    });

    return {
        table,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
