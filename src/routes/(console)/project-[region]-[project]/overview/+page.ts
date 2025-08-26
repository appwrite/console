import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getProjectRoute } from '$lib/helpers/project';

export const load: PageLoad = async ({ params }) => {
    const projectInstance = { $id: params.project, region: params.region };

    redirect(302, getProjectRoute(projectInstance, '/overview/platforms'));
};
