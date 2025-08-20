import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { tablesForSubNavigation } = await parent();
    depends(Dependencies.TABLE);

    const tableFromParentCache = tablesForSubNavigation?.tables?.find(
        (table) => table.$id === params.table
    );

    const [table, tablesForSubNav] = await Promise.all([
        tableFromParentCache
            ? tableFromParentCache
            : sdk.forProject(params.region, params.project).tablesDb.getTable({
                  databaseId: params.database,
                  tableId: params.table
              }),

        tablesForSubNavigation
            ? tablesForSubNavigation
            : sdk.forProject(params.region, params.project).tablesDb.listTables({
                  databaseId: params.database,
                  queries: [Query.orderDesc(''), Query.limit(100)]
              })
    ]);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        table,
        tablesForSubNav
    };
};
