import type { Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        const response = await sdk.forProject.project.getUsage(params.period ?? '30d');

        return {
            //  range: response string;
            requests: response.requests as unknown as Models.Metric[],
            network: response.network as unknown as Models.Metric[],
            executions: response.executions as unknown as Models.Metric[],
            documents: response.documents as unknown as Models.Metric[],
            databases: response.databases as unknown as Models.Metric[],
            users: response.users as unknown as Models.Metric[],
            storage: response.storage as unknown as Models.Metric[],
            buckets: response.buckets as unknown as Models.Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
