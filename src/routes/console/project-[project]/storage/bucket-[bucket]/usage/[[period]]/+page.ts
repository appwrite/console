import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const response = await sdkForProject().storage.getBucketUsage(
        params.bucket,
        params.period ?? '30d'
    );

    return {
        count: response.filesCount as unknown as Models.Metric[],
        created: response.filesCreate as unknown as Models.Metric[],
        read: response.filesRead as unknown as Models.Metric[],
        updated: response.filesUpdate as unknown as Models.Metric[],
        deleted: response.filesDelete as unknown as Models.Metric[]
    };
};
