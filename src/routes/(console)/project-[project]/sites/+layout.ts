import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load = async ({ depends }) => {
    depends(Dependencies.SITES);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
