import { Dependencies } from '$lib/constants';
import { sdkForConsole } from '$lib/stores/sdk';
import { selectedTab } from '../store';
import type { PageLoad } from './$types';

selectedTab.set('platforms');

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.PLATFORMS);
    return {
        platforms: await sdkForConsole.projects.listPlatforms(params.project)
    };
};
