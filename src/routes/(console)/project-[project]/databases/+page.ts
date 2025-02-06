import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { type Models, Query } from '@appwrite.io/console';
import { timeFromNow } from '$lib/helpers/date';
import type { PageLoad } from './$types';
import type { BackupPolicy } from '$lib/sdk/backups';
import { isSelfHosted } from '$lib/system';

export const load: PageLoad = async ({ url, route, depends }) => {
    depends(Dependencies.DATABASES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    const { databases, policies, lastBackups } = await fetchDatabasesAndBackups(
        limit,
        offset,
        search
    );

    return {
        offset,
        limit,
        view,
        search,
        policies,
        databases,
        lastBackups
    };
};

// TODO: @itznotabug we should improve this!
async function fetchDatabasesAndBackups(limit: number, offset: number, search: string) {
    const databases = await sdk.forProject.databases.list(
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')],
        search || undefined
    );

    const [policies, lastBackups] = await Promise.all([
        await fetchPolicies(databases),
        await fetchLastBackups(databases)
    ]);

    return { databases, policies, lastBackups };
}

async function fetchPolicies(databases: Models.DatabaseList) {
    if (isSelfHosted) return {};

    const databasePolicies: Record<string, BackupPolicy[]> = {};

    await Promise.all(
        databases.databases.map(async (database) => {
            try {
                const { policies } = await sdk.forProject.backups.listPolicies([
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

async function fetchLastBackups(databases: Models.DatabaseList) {
    if (isSelfHosted) return {};

    const lastBackups: Record<string, string> = {};

    await Promise.all(
        databases.databases.map(async (database) => {
            try {
                const { archives } = await sdk.forProject.backups.listArchives([
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
