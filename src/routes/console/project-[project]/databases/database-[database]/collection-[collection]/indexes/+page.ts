import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.INDEXES);

    return {
        indexes: await sdkForProject.databases.listIndexes(params.database, params.collection)
    };
};
