import { Dependencies } from '$lib/constants';

export const load = async ({ depends, parent }) => {
    const { members } = await parent();
    depends(Dependencies.ORGANIZATION);

    return {
        members
    };
};
