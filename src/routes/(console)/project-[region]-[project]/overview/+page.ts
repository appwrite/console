import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { selectedTab } from './store';
import { getProjectRoute } from '$lib/helpers/project';

export const load: PageLoad = async ({ params }) => {
    const projectInstance = { $id: params.project, region: params.region };

    if (get(selectedTab) === 'keys') {
        redirect(302, getProjectRoute(projectInstance, '/overview/keys'));
    } else {
        redirect(302, getProjectRoute(projectInstance, '/overview/platforms'));
    }
};
