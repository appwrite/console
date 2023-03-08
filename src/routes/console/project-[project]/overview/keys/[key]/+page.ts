import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdk, sdkForConsole } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.KEY);

    const key = await sdkForConsole.projects.getKey(params.project, params.key);
    if (key.expire) {
        key.expire = new Date(key.expire).toISOString().slice(0, 23);
    }

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        key
    };
};
