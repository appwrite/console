import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdkForProject } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.TEAM);
    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        team: await sdkForProject.teams.get(params.team)
    };
};
