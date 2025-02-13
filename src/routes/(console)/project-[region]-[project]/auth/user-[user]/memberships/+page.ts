import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    return {
        memberships: await sdk
            .forProject(params.region, params.project)
            .users.listMemberships(params.user)
    };
};
