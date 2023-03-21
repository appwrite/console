import type { Models } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const { period } = params;
    const response = await sdk.forProject.users.getUsage(period ?? '30d');
    return {
        usersTotal: response.usersTotal as unknown as Models.Metric[]
    };
};
