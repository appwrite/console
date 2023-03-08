import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk, sdkForProject } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.TEAM);
    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            team: await sdkForProject().teams.get(params.team)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
