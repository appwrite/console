import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const parentData = await parent();

    return {
        user: parentData.account,
        organization: parentData.organizations?.teams?.[0] || null
    };
};
