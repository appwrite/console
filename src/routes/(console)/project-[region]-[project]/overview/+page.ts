import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { selectedTab } from './store';

export const load: PageLoad = async ({ params }) => {
    if (get(selectedTab) === 'keys') {
        redirect(302, `${base}/project-${params.region}-${params.project}/overview/keys`);
    } else {
        redirect(302, `${base}/project-${params.region}-${params.project}/overview/platforms`);
    }
};
