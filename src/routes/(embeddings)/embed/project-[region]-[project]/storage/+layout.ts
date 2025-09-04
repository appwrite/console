import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
    const { project } = await parent();
    return { project };
};
