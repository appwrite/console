import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.PROJECT_SETTINGS);

    return {
        variables: await sdk.forProject.projectApi.listVariables()
    };
};
