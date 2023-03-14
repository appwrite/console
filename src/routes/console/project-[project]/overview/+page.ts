import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { selectedTab } from './store';

export const load: PageLoad = async ({ params }) => {
    if (get(selectedTab) === 'keys') {
        throw redirect(302, `${base}/console/project-${params.project}/overview/keys`);
    } else {
        throw redirect(302, `${base}/console/project-${params.project}/overview/platforms`);
    }
};
