import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { organizations, account } = await parent();

    const teamId = account.prefs.organization ?? organizations.teams[0]?.$id;
    if (teamId) {
        redirect(303, `${base}/organization-${teamId}/members`);
    }
    redirect(303, base);
};
