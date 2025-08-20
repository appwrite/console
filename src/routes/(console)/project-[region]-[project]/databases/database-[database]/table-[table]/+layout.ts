import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.TABLE);

    const [table, tablesForSubNavigation] = await Promise.all([
        sdk.forProject(params.region, params.project).grids.getTable({
            databaseId: params.database,
            tableId: params.table
        }),

        sdk.forProject(params.region, params.project).grids.listTables({
            databaseId: params.database,
            queries: [Query.orderDesc(''), Query.limit(100)]
        })
    ]);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        table,
        tablesForSubNavigation
    };
};
