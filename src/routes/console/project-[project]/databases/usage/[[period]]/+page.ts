import type { Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const { period } = params;
    try {
        const response = await sdk.forProject.databases.getUsage(period ?? '30d');
        return {
            databasesTotal: response.databasesTotal as unknown as Models.Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
