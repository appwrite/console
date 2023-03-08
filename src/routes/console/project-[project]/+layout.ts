import { Dependencies } from '$lib/constants';
import { sdk, sdkForConsole } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.PROJECT);

    try {
        const project = await sdkForConsole.projects.get(params.project);
        localStorage.setItem('project', project.$id);
        localStorage.setItem('organization', project.teamId);

        return {
            project,
            organization: await sdkForConsole.teams.get(project.teamId)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
