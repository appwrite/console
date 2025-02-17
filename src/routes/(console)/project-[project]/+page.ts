import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { hasOnboardingDismissed } from '$lib/helpers/onboarding';

export const load: PageLoad = async ({ params }) => {
    if (hasOnboardingDismissed(params.project)) {
        redirect(302, `${base}/project-${params.project}/overview`);
    }
    redirect(302, `${base}/project-${params.project}/get-started`);
};
