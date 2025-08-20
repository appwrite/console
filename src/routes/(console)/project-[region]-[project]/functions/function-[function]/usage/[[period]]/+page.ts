import { sdk } from '$lib/stores/sdk';
import { FunctionUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { isValueOfStringEnum } from '$lib/helpers/types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(FunctionUsageRange, params.period)
        ? params.period
        : FunctionUsageRange.ThirtyDays;

    return sdk
        .forProject(params.region, params.project)
        .functions.getUsage(params.function, period);
};
