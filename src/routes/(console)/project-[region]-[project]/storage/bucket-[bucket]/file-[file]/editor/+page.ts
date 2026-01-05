import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.FILE);
    depends(Dependencies.BUCKET);

    return {};
};
