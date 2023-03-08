import { sdk, sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.DATABASE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            database: await sdkForProject().databases.get(params.database)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
