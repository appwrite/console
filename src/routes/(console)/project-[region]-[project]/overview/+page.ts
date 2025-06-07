import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { selectedTab } from './store';

export const load: PageLoad = async ({ params }) => {
    let subroute: string;
    const tab = get(selectedTab);

    switch (tab) {
        case 'keys':
        case 'dev-keys':
            subroute = tab;
            break;
        default:
            subroute = 'platforms';
            break;
    }

    redirect(302, `${base}/project-${params.region}-${params.project}/overview/${subroute}`);
};
