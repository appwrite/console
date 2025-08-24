import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
import { getProjectRoute } from '$lib/helpers/project';

export const load: PageLoad = async ({ params, parent }) => {
    const { account } = await parent();
    const projectInstance = { $id: params.project, region: params.region };

    if (!hasOnboardingDismissed(params.project, account)) {
        redirect(302, getProjectRoute(projectInstance, '/get-started'));
    } else {
        redirect(302, getProjectRoute(projectInstance, '/overview/platforms'));
    }
};
