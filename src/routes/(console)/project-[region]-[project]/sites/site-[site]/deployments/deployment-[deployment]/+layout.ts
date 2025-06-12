import { Dependencies } from '$lib/constants';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load = async ({ depends }) => {
    depends(Dependencies.SITE);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
