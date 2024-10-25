import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load = async ({ params, depends }) => {
    depends(Dependencies.SITE);

    return {
        site: await sdk.forProject.sites.get(params.site)
    };
};
