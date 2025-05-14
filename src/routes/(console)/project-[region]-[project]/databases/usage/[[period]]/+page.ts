import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { DatabaseUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(DatabaseUsageRange, params.period)
        ? params.period
        : DatabaseUsageRange.ThirtyDays;
    try {
        return sdk.forProject(params.region, params.project).databases.getUsage(period);
    } catch (e) {
        error(e.code, e.message);
    }
};
