import type { Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        const response = await sdk.forProject.functions.getFunctionUsage(
            params.function,
            params.period ?? '30d'
        );

        return {
            count: response.executionsTotal as unknown as Models.Metric[],
            errors: response.buildsFailure as unknown as Models.Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
