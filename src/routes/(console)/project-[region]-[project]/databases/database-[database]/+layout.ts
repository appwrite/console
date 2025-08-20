import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import SubNavigation from './subNavigation.svelte';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    const database = await sdk.forProject(params.region, params.project).tablesDb.get({
        databaseId: params.database
    });

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation,
        database
    };
};
