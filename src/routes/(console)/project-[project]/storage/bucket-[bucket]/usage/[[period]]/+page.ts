import { isValueOfStringEnum } from '$lib/helpers/types';
import type { Metric, UsageBuckets } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import { StorageUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(StorageUsageRange, params.period)
        ? params.period
        : StorageUsageRange.ThirtyDays;
    const response = (await sdk.forProject.storage.getBucketUsage(
        params.bucket,
        period
    )) as unknown as UsageBuckets;

    return {
        filesTotal: response.filesTotal,
        files: response.files as Metric[],
        imageTransformationsTotal: response.imageTransformationsTotal,
        imageTransformations: response.imageTransformations as Metric[]
    };
};
