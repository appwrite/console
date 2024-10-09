import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

const handleGithubEducationMembership = async () => {
    const result = await sdk.forConsole.billing.setMembership('github-student-developer');
    if (result && 'error' in result) {
        await sdk.forConsole.account.deleteSession('current');
        redirect(
            303,
            `${base}/education/error?message=${result.error.message}&code=${result.error.code}`
        );
    }
};

const userVisitedEducationPage = (): boolean => {
    const didRegisterGithubEducationProgram =
        localStorage.getItem('githubEducationProgram') === 'true';
    localStorage.removeItem('githubEducationProgram');
    return didRegisterGithubEducationProgram;
};

export const load: PageLoad = async ({ parent, url }) => {
    const { organizations, account } = await parent();

    if (userVisitedEducationPage()) {
        await handleGithubEducationMembership();
    }

    if (organizations.total) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        if (!teamId) {
            redirect(303, `${base}/account/organizations${url.search}`);
        } else {
            redirect(303, `${base}/organization-${teamId}${url.search}`);
        }
    } else {
        redirect(303, `${base}/onboarding${url.search}`);
    }
};
