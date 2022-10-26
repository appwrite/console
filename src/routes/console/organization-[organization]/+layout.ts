import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdkForConsole } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.ORGANIZATION);

    return {
        header: Header,
        breadcrumb: Breadcrumbs,
        organization: sdkForConsole.teams.get(params.organization),
        members: sdkForConsole.teams.listMemberships(params.organization)
    };
};
