import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { project } = await parent();
    return {
        platforms: {
            platforms: project.platforms,
            total: project.platforms.length
        }
    };
};
