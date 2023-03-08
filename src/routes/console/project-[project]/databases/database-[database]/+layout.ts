import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import SecondSideNav from '$routes/console/project-[project]/databases/database-[database]/secondSideNav.svelte';
import { Query } from '@aw-labs/appwrite-console';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.DATABASE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            database: await sdkForProject.databases.get(params.database),
            secondSideNav: SecondSideNav,
            allCollections: await sdkForProject.databases.listCollections(params.database, [
                Query.orderDesc('$createdAt')
            ])
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
