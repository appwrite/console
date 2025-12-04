import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { resolvedProfile } from '$lib/profiles/index.svelte';

export const load: PageLoad = async ({ parent }) => {
    const { organizations, account } = await parent();

    const teamId =
        account.prefs[resolvedProfile.organizationPrefKey] ?? organizations.teams[0]?.$id;
    if (teamId) {
        redirect(303, `${base}/organization-${teamId}/members`);
    }
    redirect(303, base);
};
