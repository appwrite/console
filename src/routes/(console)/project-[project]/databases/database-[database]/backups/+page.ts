import { getLimit, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { BackupArchive, BackupArchiveList, BackupPolicyList } from '$lib/sdk/backups';
import { isCloud } from '$lib/system';

export const load = async ({ params, url, route, depends }) => {
    depends(Dependencies.BACKUPS);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    let backups: BackupArchiveList = { total: 0, archives: [] };
    let policies: BackupPolicyList = { total: 0, policies: [] };

    if (isCloud) {
        try {
            [backups, policies] = await Promise.all([
                sdk.forProject.backups.listArchives([
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('$createdAt'),
                    Query.equal('resourceType', 'database'),
                    Query.equal('resourceId', params.database)
                ]),

                sdk.forProject.backups.listPolicies([
                    Query.orderDesc('$createdAt'),
                    Query.equal('resourceType', 'database'),
                    Query.equal('resourceId', params.database)
                ])
            ]);
        } catch (e) {
            // ignore
        }
    }

    const archivesByPolicy = groupArchivesByPolicy(backups.archives);
    const lastBackupDates = Object.fromEntries(getLatestBackupForPolicies(archivesByPolicy));

    return {
        offset,
        limit,
        view,
        backups,
        policies,
        lastBackupDates
    };
};

const groupArchivesByPolicy = (archives: BackupArchive[]) => {
    return archives.reduce((acc, archive) => {
        if (!acc.has(archive.policyId)) {
            acc.set(archive.policyId, []);
        }
        acc.get(archive.policyId)!.push(archive);
        return acc;
    }, new Map<string, BackupArchive[]>());
};

const getLatestBackupForPolicies = (policyIdMap: Map<string, BackupArchive[]>) => {
    const latestBackups = new Map<string, string | null>();
    for (const [policyId, archives] of policyIdMap) {
        const latestBackup = archives.sort(
            (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        )[0];
        if (latestBackup && new Date(latestBackup.$createdAt).getTime() < Date.now()) {
            latestBackups.set(policyId, latestBackup.$createdAt);
        }
    }
    return latestBackups;
};
