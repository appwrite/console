import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { Breadcrumbs, useDatabaseSdk, type DatabaseType } from '$database/(entity)';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { database, project } = await parent();
    depends(Dependencies.TABLE);
    guardResourceBlock(project, ['tables', 'collections'], params.table);

    const databaseSdk = useDatabaseSdk(
        params.region,
        params.project,
        database.type as DatabaseType
    );

    const table = await databaseSdk.getEntity({
        databaseId: params.database,
        entityId: params.table
    });

    return {
        table,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
