import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import SecondSideNav from './database-[database]/secondSideNav.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
    await parent();

    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
