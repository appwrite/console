import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import Breadcrumbs from './breadcrumbs.svelte';
import SubNavigation from './subNavigation.svelte';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    const database = await sdk.forProject(params.region, params.project).tablesDB.get({
        databaseId: params.database
    });

    // only for tests
    // database.type = 'documentsdb';

    return {
        database,
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation
    };
};
