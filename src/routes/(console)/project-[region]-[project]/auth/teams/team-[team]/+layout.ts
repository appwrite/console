import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.TEAM);
    const { project } = await parent();
    guardResourceBlock(project, 'teams', params.team);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        team: await sdk.forProject(params.region, params.project).teams.get({ teamId: params.team })
    };
};
