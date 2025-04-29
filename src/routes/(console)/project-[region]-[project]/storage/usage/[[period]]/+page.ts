import { isValueOfStringEnum } from '$lib/helpers/types';
import { sdk } from '$lib/stores/sdk';
import { StorageUsageRange } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        const period = isValueOfStringEnum(StorageUsageRange, params.period)
            ? params.period
            : StorageUsageRange.ThirtyDays;
        return sdk.forProject.storage.getUsage(period);
    } catch (e) {
        error(e.code, e.message);
    }
};
