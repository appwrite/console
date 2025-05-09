import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { FunctionUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(FunctionUsageRange, params.period)
        ? params.period
        : FunctionUsageRange.ThirtyDays;
    try {
        return sdk.forProject(params.region, params.project).functions.listUsage(period);
    } catch (e) {
        error(e.code, e.message);
    }
};
