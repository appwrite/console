import { base } from '$app/paths';
import { newOrgModal } from '$lib/stores/organization';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { organizations } = await parent();
    if (organizations.total) {
        throw redirect(303, `${base}/console/organization-${organizations.teams[0].$id}`);
    } else {
        newOrgModal.set(true);
        throw redirect(303, `${base}/console`);
    }
};
