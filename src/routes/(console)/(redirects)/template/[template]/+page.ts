import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';
import { resolvedProfile } from '$lib/profiles/index.svelte';

export const load: PageLoad = async ({ parent, params }) => {
    const { organizations, account } = await parent();

    const teamId =
        account.prefs[resolvedProfile.organizationPrefKey] ?? organizations.teams[0]?.$id;
    if (teamId) {
        redirect(
            303,
            resolve('/(console)/(studio)/template-[region]-[template]', {
                template: params.template,
                region: 'fra'
            })
        );
    }
    redirect(303, resolve('/'));
};
