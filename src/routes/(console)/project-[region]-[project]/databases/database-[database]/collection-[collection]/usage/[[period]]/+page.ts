import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { UsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const { database } = await parent();
    const period = isValueOfStringEnum(UsageRange, params.period)
        ? params.period
        : UsageRange.ThirtyDays;

    const projectSdk = sdk.forProject(params.region, params.project);
    const usageFn = database.type === 'vectorsdb'
        ? projectSdk.vectorsDB.getCollectionUsage.bind(projectSdk.vectorsDB)
        : projectSdk.documentsDB.getCollectionUsage.bind(projectSdk.documentsDB);

    return {
        ...(await usageFn({
            databaseId: params.database,
            collectionId: params.collection,
            range: period
        }))
    };
};
