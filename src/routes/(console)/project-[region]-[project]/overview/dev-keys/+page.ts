import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DEV_KEYS);
    return {
        devKeys: await sdk.forConsole.projects.listDevKeys({ projectId: params.project })
    };
};
