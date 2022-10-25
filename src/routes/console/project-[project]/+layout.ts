import { Dependencies } from '$lib/constants';
import { sdkForConsole, sdkForProject, setProject } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.PROJECT);

    if (sdkForProject.client.config.project !== params.project) {
        setProject(params.project);
    }

    const project = await sdkForConsole.projects.get(params.project);
    const organization = await sdkForConsole.teams.get(project.teamId);

    return {
        project,
        organization
    };
};
