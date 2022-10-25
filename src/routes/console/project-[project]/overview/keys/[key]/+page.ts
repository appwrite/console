import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdkForConsole } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.KEY);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        key: await sdkForConsole.projects.getKey(params.project, params.key)
    };
};
