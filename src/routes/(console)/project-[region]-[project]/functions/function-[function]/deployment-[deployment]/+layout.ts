import type { LayoutLoad } from './$types';
import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';

export const load: LayoutLoad = async () => {
    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
