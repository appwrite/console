import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { selectedTab } from '../store';
import type { PageLoad } from './$types';

selectedTab.set('dev-keys');

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DEV_KEYS);
    return {
        devKeys: await sdk.forConsole.projects.listDevKeys(params.project)
    };
};
