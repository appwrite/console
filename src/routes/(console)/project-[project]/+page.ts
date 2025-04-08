import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
import { isStudio } from '$lib/system';

export const load: PageLoad = async ({ params }) => {
    if (isStudio) {
        redirect(302, `${base}/project-${params.project}/studio`);
    }
    if (hasOnboardingDismissed(params.project)) {
        redirect(302, `${base}/project-${params.project}/overview`);
    }
    redirect(302, `${base}/project-${params.project}/get-started`);
};
