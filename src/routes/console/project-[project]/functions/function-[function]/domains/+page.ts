import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.RULES);

    return {
        rules: await sdkForProject.proxy.listRules()
    };
};
