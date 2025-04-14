import { getLimit, getPage, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { BackupArchive, BackupArchiveList, BackupPolicyList } from '$lib/sdk/backups';
import { isCloud } from '$lib/system';

export const load = async ({ params, url, route, depends, parent }) => {
    depends(Dependencies.BACKUPS);
    const page = getPage(url);
    const limit = getLimit(params.project, url, route, CARD_LIMIT);
    const view = getView(params.project, url, route, View.Grid);
    const offset = pageToOffset(page, limit);

    let backups: BackupArchiveList = { total: 0, archives: [] };
    let policies: BackupPolicyList = { total: 0, policies: [] };

    // already loaded by parent.
    const { currentPlan } = await parent();
    const backupsEnabled = currentPlan?.backupsEnabled ?? true;

    if (isCloud && backupsEnabled) {
        try {
            [backups, policies] = await Promise.all([
                sdk
                    .forProject(params.region, params.project)
                    .backups.listArchives([
                        Query.limit(limit),
                        Query.offset(offset),
                        Query.orderDesc('$createdAt'),
                        Query.equal('resourceType', 'database'),
                        Query.equal('resourceId', params.database)
                    ]),

                sdk
                    .forProject(params.region, params.project)
                    .backups.listPolicies([
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
