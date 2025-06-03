import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DEV_KEY);

    const key = await sdk.forConsole.projects.getDevKey(params.project, params.key);
    if (key.expire) {
        key.expire = new Date(key.expire).toISOString().slice(0, 23);
    } else {
        key.expire = undefined;
    }

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        key
    };
};
