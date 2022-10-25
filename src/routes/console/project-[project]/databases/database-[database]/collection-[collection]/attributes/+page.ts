import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import type { Attributes } from '../store';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.ATTRIBUTES);

    return {
        attributes: (await sdkForProject.databases.listAttributes(
            params.database,
            params.collection
        )) as unknown as {
            total: number;
            attributes: Attributes[];
        }
    };
};
