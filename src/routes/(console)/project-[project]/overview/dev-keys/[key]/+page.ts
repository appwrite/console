import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DEV_KEY);

    const devKey = await sdk.forConsole.projects.getDevKey(params.project, params.key);

    if (devKey.expire) {
        devKey.expire = new Date(devKey.expire).toISOString().slice(0, 23);
    } else {
        devKey.expire = undefined;
    }

    return {
        devKey,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
