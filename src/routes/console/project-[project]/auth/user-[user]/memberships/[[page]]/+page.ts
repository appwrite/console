import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    return {
        memberships: await sdk.forProject.users.listMemberships(params.user)
    };
};
