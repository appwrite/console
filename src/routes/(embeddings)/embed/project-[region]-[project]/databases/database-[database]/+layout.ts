import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { base } from '$app/paths';
import Header from '$routes/(console)/project-[region]-[project]/databases/database-[database]/header.svelte';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    const database = await sdk.forProject(params.region, params.project).tablesDB.get({
        databaseId: params.database
    });

    return {
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/databases/database-${params.database}`,
        back: `${base}/embed/project-${params.region}-${params.project}/databases`,
        database
    };
};
