import Breadcrumbs from '../overview/breadcrumbs.svelte';
import Header from '../overview/header.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
