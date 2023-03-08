import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk, sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.USER);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            user: await sdkForProject().users.get(params.user)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
