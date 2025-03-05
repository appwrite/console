import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { StorageUsageRange, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(StorageUsageRange, params.period)
        ? params.period
        : StorageUsageRange.ThirtyDays;
    const response = (await sdk.forProject.storage.getBucketUsage(
        params.bucket,
        period
    )) as unknown as Models.UsageBuckets;

    return {
        filesTotal: response.filesTotal,
        files: response.files as Models.Metric[],
        imageTransformationsTotal: response.imageTransformationsTotal,
        imageTransformations: response.imageTransformations as Models.Metric[]
    };
};
