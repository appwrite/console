import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.DESTINATION);
    await parent();
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        destination: await sdkForProject.transfers.getDestination(params.destination)
    };
};
