import type { Models } from '@aw-labs/appwrite-console';
import { sdk, sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { period } = params;
    const response = await sdkForProject().databases.getUsage(period ?? '30d');

    return {
        count: response.databasesCount as unknown as Models.Metric[],
        created: response.databasesCreate as unknown as Models.Metric[],
        read: response.databasesRead as unknown as Models.Metric[],
        updated: response.databasesUpdate as unknown as Models.Metric[],
        deleted: response.databasesDelete as unknown as Models.Metric[]
    };
};
