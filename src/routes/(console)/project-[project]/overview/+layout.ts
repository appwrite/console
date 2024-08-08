import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
