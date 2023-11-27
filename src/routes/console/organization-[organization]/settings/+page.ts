import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.ORGANIZATION);
    return {
        projects: await sdk.forConsole.projects.list()
    };
};
