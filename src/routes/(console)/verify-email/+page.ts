import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { account } = await parent();

    return {
        user: account
    };
};
