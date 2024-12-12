import { sdk } from '$lib/stores/sdk';
import { FunctionUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { isValueOfStringEnum } from '$lib/helpers/types';

export const load: PageLoad = async ({ params }) => {
    try {
        const period = isValueOfStringEnum(FunctionUsageRange, params.period)
            ? params.period
            : FunctionUsageRange.ThirtyDays;
        return sdk
            .forProject(params.region, params.project)
            .functions.getFunctionUsage(params.function, period);
    } catch (e) {
        error(e.code, e.message);
    }
};
