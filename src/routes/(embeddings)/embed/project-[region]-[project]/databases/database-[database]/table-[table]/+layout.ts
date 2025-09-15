import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { base } from '$app/paths';
import Header from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/header.svelte';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.TABLE);

    return {
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/databases/database-${params.database}/table-${params.table}`,
        back: `${base}/embed/project-${params.region}-${params.project}/databases/database-${params.database}`,
        table: await sdk.forProject(params.region, params.project).tablesDB.getTable({
            databaseId: params.database,
            tableId: params.table
        })
    };
};
