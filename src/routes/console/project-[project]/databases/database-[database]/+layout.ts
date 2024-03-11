import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            database: await sdk.forProject.databases.get(params.database)
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
