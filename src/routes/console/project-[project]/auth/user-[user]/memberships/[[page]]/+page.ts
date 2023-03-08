import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    return {
        memberships: await sdkForProject().users.listMemberships(params.user)
    };
};
