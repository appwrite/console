import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import Breadcrumbs from './breadcrumbs.svelte';
import SubNavigation from './subNavigation.svelte';
import type { Models } from '@appwrite.io/console';
import { error } from '@sveltejs/kit';
import { guardResourceBlock } from '$lib/helpers/project';

type DatabaseWithType = Models.Database & {
    type?: string;
};

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.DATABASE);
    const { project } = await parent();
    guardResourceBlock(project, 'databases', params.database);

    const projectSdk = sdk.forProject(params.region, params.project);

    const [tablesResult, dedicatedResult] = await Promise.allSettled([
        projectSdk.tablesDB.get({ databaseId: params.database }),
        projectSdk.compute.getDatabase({ databaseId: params.database })
    ]);

    let database: DatabaseWithType | Models.DedicatedDatabase;
    let dedicatedDatabase: Models.DedicatedDatabase | null = null;

    if (tablesResult.status === 'fulfilled') {
        database = tablesResult.value;
        if (dedicatedResult.status === 'fulfilled') {
            dedicatedDatabase = dedicatedResult.value;
        }
    } else if (dedicatedResult.status === 'fulfilled') {
        dedicatedDatabase = dedicatedResult.value;
        database = dedicatedResult.value;
    } else {
        throw error(404, 'Database not found');
    }

    return {
        database,
        dedicatedDatabase,
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation
    };
};
