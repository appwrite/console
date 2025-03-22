import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { StorageUsageRange, type Models } from '@appwrite.io/console';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(StorageUsageRange, params.period)
        ? params.period
        : StorageUsageRange.ThirtyDays;

    const response = (await sdk
        .forProject(params.region, params.project)
        .storage.getBucketUsage(params.bucket, period)) as unknown as Models.UsageBuckets;

    return {
        filesTotal: response.filesTotal,
        files: response.files as Models.Metric[],
        imageTransformationsTotal: response.imageTransformationsTotal,
        imageTransformations: response.imageTransformations as Models.Metric[]
    };
};
