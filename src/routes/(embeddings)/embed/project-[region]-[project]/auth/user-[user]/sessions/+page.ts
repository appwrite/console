import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/user-[user]/header.svelte';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.SESSIONS);

    const [user, sessions] = await Promise.all([
        sdk.forProject(params.region, params.project).users.get(params.user),
        sdk.forProject(params.region, params.project).users.listSessions({ userId: params.user })
    ]);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/user-${params.user}`,
        user,
        sessions
    };
};
