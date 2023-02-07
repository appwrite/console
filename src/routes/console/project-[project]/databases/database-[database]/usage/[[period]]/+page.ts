import type { Models } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const response = await sdkForProject.databases.getDatabaseUsage(
        params.database,
        params.period ?? '30d'
    );

    return {
        collectionsTotal: response.collectionsTotal as unknown as Models.Metric[]
    };
};
