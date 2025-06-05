import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { UserUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(UserUsageRange, params.period)
        ? params.period
        : UserUsageRange.ThirtyDays;
    return sdk.forProject(params.region, params.project).users.getUsage(period);

};
