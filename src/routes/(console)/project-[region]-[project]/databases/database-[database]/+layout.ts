import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        database: await sdk.forProject(params.region, params.project).databases.get(params.database)
    };
};
