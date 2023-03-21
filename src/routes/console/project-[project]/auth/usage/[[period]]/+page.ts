import type { Models } from '@aw-labs/appwrite-console';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const { period } = params;
    try {
        const response = await sdkForProject.users.getUsage(period ?? '30d');
        return {
            count: response.usersCount as unknown as Models.Metric[],
            created: response.usersCreate as unknown as Models.Metric[],
            read: response.usersRead as unknown as Models.Metric[],
            updated: response.usersUpdate as unknown as Models.Metric[],
            deleted: response.usersDelete as unknown as Models.Metric[]
        };
    } catch (err) {
        throw error(err.code, {
            message: err.message
        })
    }
};
