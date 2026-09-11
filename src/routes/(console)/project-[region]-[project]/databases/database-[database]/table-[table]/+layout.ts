import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { Breadcrumbs, toDatabaseType, useDatabaseSdk } from '$database/(entity)';
import { guardResourceBlock } from '$lib/helpers/project';
import { AppwriteException } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { database, project } = await parent();
    depends(Dependencies.TABLE);
    guardResourceBlock(project, ['tables', 'collections'], params.table);

    const databaseSdk = useDatabaseSdk(
        params.region,
        params.project,
        toDatabaseType(database.type)
    );

    let table = null;

    try {
        table = await databaseSdk.getEntity({
            databaseId: params.database,
            entityId: params.table
        });
    } catch (e) {
        if (!(e instanceof AppwriteException) || e.code !== 404) {
            throw e;
        }
    }

    return {
        table,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
