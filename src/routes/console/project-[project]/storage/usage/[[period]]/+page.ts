import type { Models } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const response = await sdkForProject.storage.getUsage(params.period ?? '30d');

    return {
        count: response.bucketsCount as unknown as Models.Metric[],
        created: response.bucketsCreate as unknown as Models.Metric[],
        read: response.bucketsRead as unknown as Models.Metric[],
        updated: response.bucketsUpdate as unknown as Models.Metric[],
        deleted: response.bucketsDelete as unknown as Models.Metric[]
    };
};
