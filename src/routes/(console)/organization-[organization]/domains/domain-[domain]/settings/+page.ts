import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, depends }) => {
    depends(Dependencies.DOMAINS);
    const { domain } = await parent();
    return {
        domain,
        organizations: await sdk.forConsole.teams.list()
    };
};
