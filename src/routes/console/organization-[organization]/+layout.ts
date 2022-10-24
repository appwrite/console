import { organization } from '$lib/stores/organization';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent }) => {
    await parent();
    const organizationId = params.organization;
    const promises = organization.load(organizationId);
    let data = get(organization);

    if (data?.$id !== organizationId) {
        await promises;
    }
};
