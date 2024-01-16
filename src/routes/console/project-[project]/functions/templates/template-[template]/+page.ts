import { Dependencies } from '$lib/constants';
import { marketplace } from '$lib/stores/marketplace';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.FUNCTIONS);

    return {
        template: marketplace.find((template) => template.id === params.template),
        functions: await sdk.forProject.functions.list()
    };
};
