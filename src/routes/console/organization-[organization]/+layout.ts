import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.ORGANIZATION);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            organization: await sdk.forConsole.teams.get(params.organization),
            members: await sdk.forConsole.teams.listMemberships(params.organization),
            allProjects: await sdk.forConsole.projects.list([
                Query.equal('teamId', params.organization),
                Query.orderDesc('$createdAt')
            ])
        };
    } catch (e) {
        localStorage.removeItem('organization');
        throw error(e.code, e.message);
    }
};
