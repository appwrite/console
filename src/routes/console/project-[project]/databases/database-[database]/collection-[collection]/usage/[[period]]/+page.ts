import type { Metric } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = await sdk.forProject.databases.getCollectionUsage(
        params.database,
        params.collection,
        params.period ?? '30d'
    );

    return {
        documentsTotal: response.documentsTotal,
        documents: response.documents as unknown as Metric[]
    };
};
