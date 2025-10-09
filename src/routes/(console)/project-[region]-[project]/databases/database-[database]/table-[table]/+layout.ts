import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Header from './header.svelte';
import { Breadcrumbs, toSupportiveEntity } from '$database/(entity)';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.TABLE);

    const table = await sdk.forProject(params.region, params.project).tablesDB.getTable({
        databaseId: params.database,
        tableId: params.table
    });

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        table: toSupportiveEntity(table)
    };
};
