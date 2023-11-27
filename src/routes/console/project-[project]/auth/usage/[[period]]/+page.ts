import type { Metric, UsageUsers } from '$lib/sdk/usage';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const { period } = params;
    try {
        const response = (await sdk.forProject.users.getUsage(period ?? '30d')) as unknown as UsageUsers;
        return {
            usersTotal: response.usersTotal,
            users: response.users as Metric[]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
