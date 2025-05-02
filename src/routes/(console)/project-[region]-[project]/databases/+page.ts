import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { type Models, Query } from '@appwrite.io/console';
import { timeFromNow } from '$lib/helpers/date';
import type { PageLoad, RouteParams } from './$types';
import type { BackupPolicy } from '$lib/sdk/backups';
import { isSelfHosted } from '$lib/system';
import { isCloud } from '$lib/system';
import type { Plan } from '$lib/sdk/billing';

export const load: PageLoad = async ({ url, route, depends, params, parent }) => {
    depends(Dependencies.DATABASES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(params.project, url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    // already loaded by parent.
    const { currentPlan } = await parent();

    const { databases, policies, lastBackups } = await fetchDatabasesAndBackups(
        limit,
        offset,
        search,
        params,
        currentPlan
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

async function fetchDatabasesAndBackups(
    limit: number,
    offset: number,
    params: RouteParams,
    search?: string | undefined,
    currentPlan?: Plan
) {
    const backupsEnabled = currentPlan?.backupsEnabled ?? true;

    const databases = await sdk
        .forProject(params.region, params.project)
        .databases.list(
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')],
            search || undefined
        );

    let lastBackups: Record<string, string>, policies: Record<string, BackupPolicy[]>;

    if (isCloud && backupsEnabled) {
        [policies, lastBackups] = await Promise.all([
            fetchPolicies(databases, params),
            fetchLastBackups(databases, params)
        ]);
    }

    return { databases, policies, lastBackups };
}

async function fetchPolicies(databases: Models.DatabaseList, params: RouteParams) {
    if (isSelfHosted) return {};

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
    if (isSelfHosted) return {};

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
