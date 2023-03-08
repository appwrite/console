import { Dependencies } from '$lib/constants';
import { sdk, sdkForConsole } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.ACCOUNT_SESSIONS);

    return {
        sessions: await sdkForConsole.account.listSessions()
    };
};
