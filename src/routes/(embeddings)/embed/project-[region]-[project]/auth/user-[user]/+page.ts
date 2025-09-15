import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import Header from '$routes/(console)/project-[region]-[project]/auth/user-[user]/header.svelte';
import { base } from '$app/paths';

export const load: PageLoad = async ({ params }) => {
    const [user, userFactors] = await Promise.all([
        sdk.forProject(params.region, params.project).users.get(params.user),
        sdk.forProject(params.region, params.project).users.listMfaFactors(params.user)
    ]);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/user-${params.user}`,
        user,
        userFactors
    };
};
