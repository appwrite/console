import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { FunctionUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(FunctionUsageRange, params.period)
        ? params.period
        : FunctionUsageRange.ThirtyDays;

    return sdk.forProject(params.region, params.project).functions.listUsage(period);
};
