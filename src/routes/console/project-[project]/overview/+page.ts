import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    throw redirect(302, `${base}/console/project-${params.project}/overview/platforms`);
};
