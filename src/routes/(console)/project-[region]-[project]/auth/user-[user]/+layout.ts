import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.USER);
    const { project } = await parent();
    guardResourceBlock(project, 'users', params.user);

    const [user, userFactors] = await Promise.all([
        sdk.forProject(params.region, params.project).users.get({ userId: params.user }),
        sdk.forProject(params.region, params.project).users.listMFAFactors({ userId: params.user })
    ]);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        user,
        userFactors
    };
};
