import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { StorageUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(StorageUsageRange, params.period)
        ? params.period
        : StorageUsageRange.ThirtyDays;
    return sdk.forProject(params.region, params.project).storage.getUsage(period);
};
