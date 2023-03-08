import { Dependencies } from '$lib/constants';
import { sdk, sdkForConsole } from '$lib/stores/sdk';
import { selectedTab } from '../store';
import type { PageLoad } from './$types';

selectedTab.set('keys');

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.KEYS);
    return {
        keys: await sdkForConsole.projects.listKeys(params.project)
    };
};
