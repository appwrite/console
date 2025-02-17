import { Dependencies } from '$lib/constants';

export const load = async ({ parent, depends }) => {
    depends(Dependencies.DOMAINS);
    const { domain } = await parent();
    return {
        domain
    };
};
