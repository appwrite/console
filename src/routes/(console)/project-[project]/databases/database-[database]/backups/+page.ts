import { getLimit, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import type { PageLoad } from './$types';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { type Models, Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.BACKUPS);
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    let backups: Models.BackupArchiveList = { total: 0, archives: [] };
    let policies: Models.BackupPolicyList = { total: 0, policies: [] };

    try {
        [backups, policies] = await Promise.all([
            await sdk.forProject.backups.listArchives([
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                Query.equal('resourceType', 'database'),
                Query.equal('resourceId', params.database)
            ]),

            await sdk.forProject.backups.listPolicies([
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                Query.equal('resourceType', 'database'),
                Query.equal('resourceId', params.database)
            ])
        ]);
    } catch (e) {
        // ignore
    }

    const lastBackupDates: Record<string, string | null> = policies.policies.reduce(
        (acc, policy) => {
            const lastBackup = getPreviousBackup(policy, backups.archives);
            if (lastBackup) acc[policy.$id] = lastBackup;
            return acc;
        },
        {}
    );

    return {
        offset,
        limit,
        view,
        backups,
        policies,
        lastBackupDates
    };
};

// TODO: would be best if we could get the last backup from the database model itself.
const getPreviousBackup = (
    policy: Models.BackupPolicy,
    archives: Models.BackupArchive[]
): string | null => {
    const latestBackup = archives
        .filter((archive) => archive.policyId === policy.$id)
        .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())[0];

    return latestBackup && new Date(latestBackup.$createdAt).getTime() < Date.now()
        ? latestBackup.$createdAt
        : null;
};
