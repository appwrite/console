import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { UsageRange, type Models } from '@appwrite.io/console';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(UsageRange, params.period)
        ? params.period
        : UsageRange.ThirtyDays;

    const response = (await sdk
        .forProject(params.region, params.project)
        .storage.getBucketUsage({
            bucketId: params.bucket,
            range: period
        }));

    return {
        filesTotal: response.filesTotal,
        files: response.files as Models.Metric[],
        imageTransformationsTotal: response.imageTransformationsTotal,
        imageTransformations: response.imageTransformations as Models.Metric[]
    };
};
