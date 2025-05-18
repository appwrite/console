import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load = async ({ depends }) => {
    depends(Dependencies.SITE);
    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
