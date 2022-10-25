import { organization } from '$lib/stores/organization';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';
import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';

export const load: LayoutLoad = async ({ params }) => {
    const organizationId = params.organization;
    const promises = organization.load(organizationId);
    let data = get(organization);

    if (data?.$id !== organizationId) {
        await promises;
    }

    return {
        header: Header,
        breadcrumb: Breadcrumbs
    };
};
