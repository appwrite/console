import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.ACCOUNT_SESSIONS);

    const [sessions, identities] = await Promise.all([
        sdk.forConsole.account.listSessions(),
        sdk.forConsole.account.listIdentities()
    ]);

    return { sessions, identities };
};
