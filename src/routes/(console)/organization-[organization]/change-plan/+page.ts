import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, parent }) => {
    const { members } = await parent();

    depends(Dependencies.ORGANIZATION);
    return {
        members
    };
};
