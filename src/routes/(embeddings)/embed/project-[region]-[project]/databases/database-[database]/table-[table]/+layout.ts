import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.TABLE);

    return {
        table: await sdk.forProject(params.region, params.project).tablesDB.getTable({
            databaseId: params.database,
            tableId: params.table
        })
    };
};
