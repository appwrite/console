import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.ORGANIZATION);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            organization: await sdk.forConsole.teams.get(params.organization),
            members: await sdk.forConsole.teams.listMemberships(params.organization)
        };
    } catch (e) {
        localStorage.removeItem('organization');
        throw error(e.code, e.message);
    }
};
