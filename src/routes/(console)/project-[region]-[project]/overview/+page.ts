import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { selectedTab } from './store';

export const load: PageLoad = async ({ params }) => {
    const tab = get(selectedTab);

    switch (tab) {
        case 'keys':
        case 'dev-keys':
            return redirect(
                302,
                `${base}/project-${params.region}-${params.project}/overview/${tab}`
            );
        default:
            return redirect(
                302,
                `${base}/project-${params.region}-${params.project}/overview/platforms`
            );
    }
};
