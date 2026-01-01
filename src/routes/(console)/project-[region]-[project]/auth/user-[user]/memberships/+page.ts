import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.MEMBERSHIPS);

    const codes = await sdk.forProject(params.region, params.project).locale.listCodes();
    return {
        localeCodes: codes.localeCodes,
        memberships: await sdk
            .forProject(params.region, params.project)
            .users.listMemberships({ userId: params.user })
    };
};
