import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import Breadcrumbs from './breadcrumbs.svelte';
import SubNavigation from './subNavigation.svelte';
import type { Models } from '@appwrite.io/console';

type DatabaseWithType = Models.Database & {
    type?: string;
};

function isDedicatedDatabaseType(type: string | undefined): boolean {
    return type === 'dedicated' || type === 'shared';
}

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    const projectSdk = sdk.forProject(params.region, params.project);

    let database: DatabaseWithType | Models.DedicatedDatabase;
    let dedicatedDatabase: Models.DedicatedDatabase | null = null;

    try {
        database = await projectSdk.tablesDB.get({
            databaseId: params.database
        });
    } catch {
        database = await projectSdk.compute.getDatabase({ databaseId: params.database });
        dedicatedDatabase = database as Models.DedicatedDatabase;
    }

    const dbType = database.type as string | undefined;
    if (isDedicatedDatabaseType(dbType) && !dedicatedDatabase) {
        try {
            dedicatedDatabase = await projectSdk.compute.getDatabase({ databaseId: params.database });
        } catch {
            // Fallback - dedicated details not available
        }
    }

    return {
        database,
        dedicatedDatabase,
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation
    };
};
