import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.ORGANIZATION);

    const key = await sdk.forConsole.organizations.getKey({
        organizationId: params.organization,
        keyId: params.keyId
    });

    return {
        key
    };
};
