import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.ACCOUNT);

    const key = await sdk.forConsole.account.getKey({
        keyId: params.tokenId
    });

    return {
        key
    };
};
