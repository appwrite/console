import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { UsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(UsageRange, params.period)
        ? params.period
        : UsageRange.ThirtyDays;

    return sdk.forProject(params.region, params.project).tablesDB.listUsage({ range: period });
};
