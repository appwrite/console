import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    redirect(302, `${base}/project-${params.region}-${params.project}/overview`);
};
