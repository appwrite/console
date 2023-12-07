import type { Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        const response = await sdk.forProject.project.getUsage(params.period ?? '30d');
        console.log(response);
        return {
            range: response.range,
            bucketsTotal: response.bucketsTotal as unknown as Models.Metric[],
            filesTotal: response.filesStorage as unknown as Models.Metric[],
            databasesTotal: response.databasesTotal as unknown as Models.Metric[],
            documentsTotal: response.documentsTotal as unknown as Models.Metric[],
            executionsTotal: response.executionsTotal as unknown as Models.Metric[],
            networkTotal: response.network as unknown as Models.Metric[],
            requestsTotal: response.requestsTotal as unknown as Models.Metric[],
            usersTotal: response.usersTotal as unknown as Models.Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
