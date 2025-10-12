import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolvedProfile } from '$lib/profiles/index.svelte';

export const load: PageLoad = async ({ params }) => {
    redirect(302, resolvedProfile.getProjectRoute(params));
};
