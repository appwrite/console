import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.PLATFORM);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        platform: await sdk.forProject(params.region, params.project).project.getPlatform({
            platformId: params.platform
        })
    };
};
