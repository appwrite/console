import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { Dependencies } from '$lib/constants';

export const load = async ({ params }) => {
    depends(Dependencies.SITE);


    const site = 

    return {
        site : await sdk.forProject.sites.get([
       
    ]);
    };
};
