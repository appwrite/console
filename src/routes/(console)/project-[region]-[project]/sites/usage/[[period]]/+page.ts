import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { SiteUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(SiteUsageRange, params.period)
        ? params.period
        : SiteUsageRange.ThirtyDays;
    try {
        return sdk.forProject(page.params.region, page.params.project).sites.listUsage(period);
    } catch (e) {
        error(e.code, e.message);
    }
};
