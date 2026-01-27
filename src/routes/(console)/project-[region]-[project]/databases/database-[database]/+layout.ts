import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import Breadcrumbs from './breadcrumbs.svelte';
import SubNavigation from './subNavigation.svelte';
import type { DedicatedDatabase, DedicatedDatabaseCredentials } from '$lib/sdk/dedicatedDatabases';
import type { Models } from '@appwrite.io/console';

type DatabaseWithType = Models.Database & {
    type?: string;
};

function isDedicatedDatabaseType(type: string | undefined): boolean {
    return type === 'prismapostgres' || type === 'dedicateddb';
}

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.DATABASE);

    const projectSdk = sdk.forProject(params.region, params.project);

    // Try to get from tablesDB first (handles legacy, tablesdb, documentsdb)
    let database: DatabaseWithType | DedicatedDatabase;
    let dedicatedDatabase: DedicatedDatabase | null = null;
    let credentials: DedicatedDatabaseCredentials | null = null;

    try {
        database = await projectSdk.tablesDB.get({
            databaseId: params.database
        });
    } catch {
        // If not found in tablesDB, try dedicated databases
        database = await projectSdk.dedicatedDatabases.get(params.database);
        dedicatedDatabase = database as DedicatedDatabase;
    }

    // If it's a dedicated database type, fetch additional details
    const dbType = database.type as string | undefined;
    if (isDedicatedDatabaseType(dbType) && !dedicatedDatabase) {
        try {
            dedicatedDatabase = await projectSdk.dedicatedDatabases.get(params.database);
        } catch {
            // Fallback - dedicated details not available
        }
    }

    // Fetch credentials for dedicated databases
    if (dedicatedDatabase) {
        try {
            credentials = await projectSdk.dedicatedDatabases.getCredentials(params.database);
        } catch {
            // Credentials not available yet (e.g., still provisioning)
        }
    }

    return {
        database,
        dedicatedDatabase,
        credentials,
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation
    };
};
