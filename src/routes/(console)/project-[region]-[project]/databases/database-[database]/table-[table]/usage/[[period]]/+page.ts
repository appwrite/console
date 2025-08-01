import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { GridUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(GridUsageRange, params.period)
        ? params.period
        : GridUsageRange.ThirtyDays;

    return sdk
        .forProject(params.region, params.project)
        .grids.getTableUsage(params.database, params.table, period);
};
