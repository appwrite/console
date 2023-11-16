import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { organizations, account } = await parent();
    if (organizations.total) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        throw redirect(303, `${base}/console/organization-${teamId}`);
    } else {
        throw redirect(303, `${base}/console/onboarding`);
    }
};
