import type { Models } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = await sdk.forProject.databases.getDatabaseUsage(
        params.database,
        params.period ?? '30d'
    );

    return {
        collectionsTotal: response.collectionsTotal as unknown as Models.Metric[]
    };
};
