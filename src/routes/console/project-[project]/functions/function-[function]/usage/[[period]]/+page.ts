import type { Metric, UsageFunctions } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        const response = (await sdk.forProject.functions.getFunctionUsage(
            params.function,
            params.period ?? '30d'
        )) as unknown as UsageFunctions;

        return {
            executionsTotal: response.executionsTotal,
            executions: response.executions as Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
