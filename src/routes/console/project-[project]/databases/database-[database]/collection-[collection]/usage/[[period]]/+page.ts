import type { Models } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = await sdk.forProject.databases.getCollectionUsage(
        params.database,
        params.collection,
        params.period ?? '30d'
    );

    return {
        count: response.documentsCount as unknown as Models.Metric[],
        created: response.documentsCreate as unknown as Models.Metric[],
        read: response.documentsRead as unknown as Models.Metric[],
        updated: response.documentsUpdate as unknown as Models.Metric[],
        deleted: response.documentsDelete as unknown as Models.Metric[]
    };
};
