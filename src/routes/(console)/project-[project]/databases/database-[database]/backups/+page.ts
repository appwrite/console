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
                Query.orderDesc('')
                // TODO: add queries once supported.
                // Query.equal('resourceType', 'database'),
                // Query.equal('resourceId', params.database),
            ])
        ]);
    } catch (e) {
        // ignore
    }

    return {
        offset,
        limit,
        view,
        backups,
        policies
    };
};
