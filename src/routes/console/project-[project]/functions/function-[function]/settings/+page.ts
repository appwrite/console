import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.VARIABLES);

    return {
        variables: await sdkForProject().functions.listVariables(params.function)
    };
};
