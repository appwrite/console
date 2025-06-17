import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { VARS } from '$lib/system';

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

    const isApplyingCredit = url.pathname.includes('apply-credit');

    if (userVisitedEducationPage()) {
        await handleGithubEducationMembership(account.name, account.email);
        redirect(303, base);
    } else if (organizations.total && !isApplyingCredit) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        if (!teamId) {
            redirect(303, `${base}/account/organizations${url.search}`);
        } else {
            redirect(303, `${base}/organization-${teamId}${url.search}`);
        }
    } else if (!isApplyingCredit) {
        redirect(303, `${base}/onboarding/create-project${url.search}`);
    }
};

const setToGhStudentMailingList = async (name: string, email: string) => {
    const body = name !== '' ? { name, email } : { email };
    return fetch(`${VARS.GROWTH_ENDPOINT}/mailinglists/gh-student`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
