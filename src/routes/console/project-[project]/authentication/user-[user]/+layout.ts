import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.USER);
    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        user: sdkForProject.users.get(params.user)
    };
};
