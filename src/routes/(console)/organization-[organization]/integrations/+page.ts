import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.ORGANIZATION);

    const keys = await sdk.forConsole.organizations.listKeys({
        organizationId: params.organization,
        total: true
    });

    return {
        keys
    };
};
