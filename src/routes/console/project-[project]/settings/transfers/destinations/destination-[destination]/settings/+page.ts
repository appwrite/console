import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.DESTINATION);
    return {
        destination: await sdkForProject.transfers.getDestination(params.destination)
    };
};
