import { Dependencies } from '$lib/constants';
import { sdk, sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.SESSIONS);
    return {
        sessions: await sdkForProject().users.listSessions(params.user)
    };
};
