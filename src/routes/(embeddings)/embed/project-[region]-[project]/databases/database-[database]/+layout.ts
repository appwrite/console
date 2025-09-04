import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    const database = await sdk.forProject(params.region, params.project).tablesDB.get({
        databaseId: params.database
    });

    return {
        database
    };
};
