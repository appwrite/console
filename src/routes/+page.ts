import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

const handleGithubEducationMembership = async (name: string, email: string) => {
    const result = await sdk.forConsole.billing.setMembership('github-student-developer');
    if (result && 'error' in result) {
        if (result.error.code === 409) {
            redirect(303, `${base}/account/organizations`);
        } else {
            await sdk.forConsole.account.deleteSession('current');
            redirect(
                303,
                `${base}/education/error?message=${result.error.message}&code=${result.error.code}`
            );
        }
    } else if (result && '$createdAt' in result) {
        setToGhStudentMailingList(name, email);
    }
};

const userVisitedEducationPage = (): boolean => {
    const didRegisterGithubEducationProgram =
        localStorage.getItem('githubEducationProgram') === 'true';
    localStorage.removeItem('githubEducationProgram');
    return didRegisterGithubEducationProgram || location.pathname.includes('education');
};

export const load: PageLoad = async ({ parent, url }) => {
    const { organizations, account } = await parent();

    if (userVisitedEducationPage()) {
        await handleGithubEducationMembership(account.name, account.email);
        redirect(303, base);
    } else if (organizations.total) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        if (!teamId) {
            redirect(303, `${base}/account/organizations${url.search}`);
        } else {
            redirect(303, `${base}/organization-${teamId}${url.search}`);
        }
    } else {
        redirect(303, `${base}/onboarding/create-project${url.search}`);
    }
};

const setToGhStudentMailingList = async (name: string, email: string) => {
    const path = `/mailinglists/gh-student`;
    const body = name !== '' ? { name, email } : { email };
    return fetch('https://growth.appwrite.io/v1' + path, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
