import type { LayoutLoad } from './$types';
import Header from '../overview/header.svelte';
import Breadcrumbs from '../overview/breadcrumbs.svelte';

export const load: LayoutLoad = () => {
    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
