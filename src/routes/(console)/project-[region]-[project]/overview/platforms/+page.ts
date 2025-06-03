import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { selectedTab } from '../store';
import type { PageLoad } from './$types';

selectedTab.set('platforms');

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.PLATFORMS);
    return {
        platforms: await sdk.forConsole.projects.listPlatforms(params.project)
    };
};
