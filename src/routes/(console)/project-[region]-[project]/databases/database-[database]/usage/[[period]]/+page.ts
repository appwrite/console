import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { DatabaseUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(DatabaseUsageRange, params.period)
        ? params.period
        : DatabaseUsageRange.ThirtyDays;
    return sdk
        .forProject(params.region, params.project)
        .databases.getDatabaseUsage(params.database, period);
};
