import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    return redirect(302, `${base}/project-${params.region}-${params.project}/overview/platforms`);
};
