import { sdk } from '$lib/stores/sdk';
import type { Metric } from '$lib/sdk/usage';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = await sdk.forProject.storage.getBucketUsage(
        params.bucket,
        params.period ?? '30d'
    );

    return {
        filesTotal: response.filesTotal,
        files: response.files as unknown as Metric[]
    };
};
