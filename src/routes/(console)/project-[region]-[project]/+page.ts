import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { hasOnboardingDismissed } from '$lib/helpers/onboarding';

export const load: PageLoad = async ({ params }) => {
    const path = !hasOnboardingDismissed(params.project) ? 'get-started' : 'overview/platforms';

    redirect(302, `${base}/project-${params.region}-${params.project}/${path}`);
};
