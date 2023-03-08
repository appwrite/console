import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.PROJECT);

    try {
        const project = await sdk.forConsole.projects.get(params.project);
        localStorage.setItem('project', project.$id);
        localStorage.setItem('organization', project.teamId);

        return {
            project,
            organization: await sdk.forConsole.teams.get(project.teamId)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
