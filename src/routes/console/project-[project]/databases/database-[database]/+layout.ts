import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.DATABASE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            database: await sdkForProject.databases.get(params.database)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
