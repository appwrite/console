import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.VARIABLES);

    return {
        variables: await sdk.forProject.functions.listVariables(params.function)
    };
};
