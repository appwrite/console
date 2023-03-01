import type { Models } from '@appwrite.io/console';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const response = await sdkForProject.functions.getFunctionUsage(
        params.function,
        params.period ?? '30d'
    );

    return {
        count: response.executionsTotal as unknown as Models.Metric[],
        errors: response.buildsFailure as unknown as Models.Metric[]
    };
};
