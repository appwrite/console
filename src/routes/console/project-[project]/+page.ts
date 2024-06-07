import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    redirect(303, `${base}/console/project-${params.project}/overview`);
};
