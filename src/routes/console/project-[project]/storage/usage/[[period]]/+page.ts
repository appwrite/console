import type { Models } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const response = await sdkForProject.storage.getUsage(params.period ?? '30d');

    return {
        bucketsTotal: response.bucketsTotal as unknown as Models.Metric[]
    };
};
