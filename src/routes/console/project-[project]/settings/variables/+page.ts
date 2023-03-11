import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
    await parent();
    depends(Dependencies.VARIABLES);

    return {
        variables: await sdkForProject.project.listVariables()
    };
};
