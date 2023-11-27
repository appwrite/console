import type { Metric, UsageDatabase} from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = (await sdk.forProject.databases.getDatabaseUsage(
        params.database,
        params.period ?? '30d'
    )) as unknown as UsageDatabase;

    return {
        collectionsTotal: response.collectionsTotal,
        collections: response.collections as Metric[]
    };
};
