import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getLimit, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { type Models, Query } from '@appwrite.io/console';
import { timeFromNow } from '$lib/helpers/date';
import type { PageLoad, RouteParams } from './$types';
import type { BackupPolicy } from '$lib/sdk/backups';

export const load: PageLoad = async ({ url, route, depends, params }) => {
    depends(Dependencies.DATABASES);

    const page = getPage(url);
    const limit = getLimit(params.project, url, route, CARD_LIMIT);
    const view = getView(params.project, url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    const { databases, policies, lastBackups } = await fetchDatabasesAndBackups(
        limit,
        offset,
        params
    );

    return {
        offset,
        limit,
        view,
        policies,
        databases,
        lastBackups
    };
};

// TODO: @itznotabug we should improve this!
async function fetchDatabasesAndBackups(limit: number, offset: number, params: RouteParams) {
    const databases = await sdk
        .forProject(params.region, params.project)
        .databases.list([Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')]);

    const [policies, lastBackups] = await Promise.all([
        await fetchPolicies(databases, params),
        await fetchLastBackups(databases, params)
    ]);

    return { databases, policies, lastBackups };
}

async function fetchPolicies(databases: Models.DatabaseList, params: RouteParams) {
    const databasePolicies: Record<string, BackupPolicy[]> = {};

    await Promise.all(
        databases.databases.map(async (database) => {
            try {
                const { policies } = await sdk
                    .forProject(params.region, params.project)
                    .backups.listPolicies([
                        // TODO: are all needed!?
                        // Query.limit(3),
                        Query.equal('resourceType', 'database'),
                        Query.equal('resourceId', database.$id)
                    ]);

                if (policies.length > 0) {
                    databasePolicies[database.$id] = policies;
                }
            } catch (e) {
                // ignore
            }
        })
    );

    return databasePolicies;
}

async function fetchLastBackups(databases: Models.DatabaseList, params: RouteParams) {
    const lastBackups: Record<string, string> = {};

    await Promise.all(
        databases.databases.map(async (database) => {
            try {
                const { archives } = await sdk
                    .forProject(params.region, params.project)
                    .backups.listArchives([
                        Query.limit(1),
                        Query.orderDesc('$createdAt'),
                        Query.equal('resourceType', 'database'),
                        Query.equal('resourceId', database.$id)
                    ]);

                if (archives.length > 0) {
                    lastBackups[database.$id] = timeFromNow(archives[0].$createdAt);
                }
            } catch (e) {
                // ignore
            }
        })
    );

    return lastBackups;
}
