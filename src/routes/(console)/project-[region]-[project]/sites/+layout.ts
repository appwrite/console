import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';

export const load = async ({ depends }) => {
    depends(Dependencies.SITES);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
