import type { Metric, UsageStorage } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        const response = (await sdk.forProject.storage.getUsage(params.period ?? '30d')) as unknown as UsageStorage;

        return {
            bucketsTotal: response.bucketsTotal,
            buckets: response.buckets as Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
