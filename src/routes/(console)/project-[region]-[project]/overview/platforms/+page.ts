import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { platforms } = await parent();
    return {
        platforms
    };
};
