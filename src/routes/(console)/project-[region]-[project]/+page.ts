import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
import { PUBLIC_CONSOLE_PROFILE } from '$env/static/public';
import { resolvedProfile } from '$lib/profiles/index.svelte';

export const load: PageLoad = async ({ params, parent }) => {
    const { account } = await parent();
    const baseRedirectUrl = `${base}/project-${params.region}-${params.project}`;

    if (!hasOnboardingDismissed(params.project, account)) {
        redirect(302, `${baseRedirectUrl}/get-started`);
    } else {
        redirect(
            302,
            resolvedProfile.getProjectRoute({ region: params.region, project: params.project })
        );
    }
};
