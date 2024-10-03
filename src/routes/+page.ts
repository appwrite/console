import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ parent, url }) => {
    const { organizations, account } = await parent();

    if (organizations.total) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        if (!teamId) {
            redirect(303, `${base}/account/organizations${url.search}`);
        } else {
            redirect(303, `${base}/organization-${teamId}${url.search}`);
        }
    } else {
        const didRegisterGithubEducationProgram =
            localStorage.getItem('githubEducationProgram') === 'true';
        localStorage.removeItem('githubEducationProgram');
        if (didRegisterGithubEducationProgram) {
            await sdk.forConsole.billing.setMembership('github-student-developer');
        }
        redirect(303, `${base}/onboarding${url.search}`);
    }
};
