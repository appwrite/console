import { organization } from '$lib/stores/organization';
import { sdkForProject, setProject } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import { project } from './store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent }) => {
    await parent();
    let data = get(project);
    let dataOrg = get(organization);
    const projectId = params.project;
    if (sdkForProject.client.config.project !== projectId) {
        setProject(projectId);
        /**
         * Clear cache
         */
        globalThis.sessionStorage.clear();
    }

    const promiseProject = project.load(projectId);
    if (data?.$id !== projectId) {
        await promiseProject;
        data = get(project);

        const promiseOrganization = organization.load(data.teamId);
        if (dataOrg?.$id !== data?.teamId) {
            await promiseOrganization;
        }
    }
    return true;
};
