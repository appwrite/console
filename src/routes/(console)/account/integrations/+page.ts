import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.ACCOUNT);

    const keys = await sdk.forConsole.account.listKeys({
        total: true
    });

    return {
        keys
    };
};
