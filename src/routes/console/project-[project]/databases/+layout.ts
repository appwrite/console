import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load: LayoutLoad = async ({ parent }) => {
    await parent();

    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
