import type { Models } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    try {
        const response = await sdkForProject.functions.getFunctionUsage(
            params.function,
            params.period ?? '30d'
        );

        return {
            count: response.executionsTotal as unknown as Models.Metric[],
            errors: response.buildsFailure as unknown as Models.Metric[]
        };
    } catch (err) {
        throw error(err.code, {
            message: err.message
          })
    }
};
