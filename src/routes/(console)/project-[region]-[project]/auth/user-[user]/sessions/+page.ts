import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.SESSIONS);

    return {
        sessions: await sdk
            .forProject(params.region, params.project)
            .users.listSessions(params.user)
    };
};
