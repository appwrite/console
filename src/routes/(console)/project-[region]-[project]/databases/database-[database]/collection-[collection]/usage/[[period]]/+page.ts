import { isValueOfStringEnum } from '$lib/helpers/types';
import { UsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { getCollectionService } from '$database/(entity)';

export const load: PageLoad = async ({ params, parent }) => {
    const { database } = await parent();
    const period = isValueOfStringEnum(UsageRange, params.period)
        ? params.period
        : UsageRange.ThirtyDays;

    const collectionSdk = getCollectionService(params.region, params.project, database.type);

    return {
        ...(await collectionSdk.getCollectionUsage({
            databaseId: params.database,
            collectionId: params.collection,
            range: period
        }))
    };
};
