import type { Models } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const { period } = params;
    const response = await sdkForProject.databases.getUsage(period ?? '30d');

    return {
        databasesTotal: response.databasesTotal as unknown as Models.Metric[]
    };
};
