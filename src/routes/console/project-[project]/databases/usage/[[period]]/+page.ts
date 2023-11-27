import type { Metric } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const { period } = params;
    try {
        const response = await sdk.forProject.databases.getUsage(period ?? '30d');
        return {
            databasesTotal: response.databasesTotal,
            databases: response.databases as unknown as Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
