import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';

export const load: PageLoad = async ({ parent }) => {
    const { organizations } = await parent();

    if (resolvedProfile.id === ProfileMode.STUDIO && organizations.total > 0) {
        redirect(303, resolve('/'));
    }
};
