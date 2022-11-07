import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.SESSIONS);
    await parent();

    return {
        sessions: await sdkForProject.users.listSessions(params.user)
    };
};
