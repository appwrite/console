import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/user-[user]/header.svelte';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';

export const load: PageLoad = async ({ params }) => {
    const [codes, user, memberships] = await Promise.all([
        sdk.forProject(params.region, params.project).locale.listCodes(),
        sdk.forProject(params.region, params.project).users.get(params.user),
        sdk.forProject(params.region, params.project).users.listMemberships({ userId: params.user })
    ]);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/user-${params.user}`,
        user,
        localeCodes: codes.localeCodes,
        memberships
    };
};

