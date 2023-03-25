import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FUNCTION);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            function: await sdk.forProject.functions.get(params.function)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
