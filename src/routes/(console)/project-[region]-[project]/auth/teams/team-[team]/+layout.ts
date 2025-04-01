import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.TEAM);
    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            team: await sdk.forProject(params.region, params.project).teams.get(params.team)
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
