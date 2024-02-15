import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { UserUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const period = isValueOfStringEnum(UserUsageRange, params.period)
        ? params.period
        : UserUsageRange.ThirtyDays;
    try {
        return sdk.forProject.users.getUsage(period);
    } catch (e) {
        error(e.code, e.message);
    }
};
