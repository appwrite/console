import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load = async ({ params, depends }) => {
    depends(Dependencies.SITES_DOMAINS);

    return {
        domain: await sdk.forProject.proxy.getRule(params.domain)
    };
};
