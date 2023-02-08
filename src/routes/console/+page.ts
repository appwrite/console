import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { organizations } = await parent();
    if (organizations.total) {
        const teamId = localStorage.getItem('organization') ?? organizations.teams[0].$id;
        throw redirect(303, `${base}/console/organization-${teamId}`);
    } else {
        throw redirect(303, `${base}/console/onboarding`);
    }
};
