import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = await sdk.forProject.storage.getBucketUsage(
        params.bucket,
        params.period ?? '30d'
    );

    return {
        filesTotal: response.filesTotal as unknown as Models.Metric[]
    };
};
