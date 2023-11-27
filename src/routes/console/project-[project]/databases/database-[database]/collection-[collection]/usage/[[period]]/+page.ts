import type { Metric, UsageCollection } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = (await sdk.forProject.databases.getCollectionUsage(
        params.database,
        params.collection,
        params.period ?? '30d'
    )) as unknown as UsageCollection;

    return {
        documentsTotal: response.documentsTotal,
        documents: response.documents as Metric[]
    };
};
