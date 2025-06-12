import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { SiteUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(SiteUsageRange, params.period)
        ? params.period
        : SiteUsageRange.ThirtyDays;
    return sdk.forProject(params.region, params.project).sites.listUsage(period);
};
