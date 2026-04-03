import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import Breadcrumbs from './breadcrumbs.svelte';
import SubNavigation from './subNavigation.svelte';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.DATABASE);
    const { project } = await parent();
    guardResourceBlock(project, 'databases', params.database);

    const database = await sdk.forProject(params.region, params.project).tablesDB.get({
        databaseId: params.database
    });

    return {
        database,
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation
    };
};
