import type { Models } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const response = await sdk.forProject.functions.getFunctionUsage(
        params.function,
        params.period ?? '30d'
    );

    return {
        executionsTotal: response.executionsTotal as unknown as Models.Metric[]
    };
};
