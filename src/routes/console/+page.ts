import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
    const { organizations, account } = await parent();

    if (organizations.total) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        if (!teamId) {
            throw redirect(303, `${base}/console/account/organizations${url.search ?? ''}`);
        } else throw redirect(303, `${base}/console/organization-${teamId}${url.search ?? ''}`);
    } else {
        throw redirect(303, `${base}/console/onboarding${url.search ?? ''}`);
    }
};
