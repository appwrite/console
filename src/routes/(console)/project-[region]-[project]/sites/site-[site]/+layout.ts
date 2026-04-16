import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { guardResourceBlock } from '$lib/helpers/project';

export const load = async ({ depends, params, parent }) => {
    depends(Dependencies.SITE);
    const { project } = await parent();
    guardResourceBlock(project, 'sites', params.site);

    const [site] = await Promise.all([
        sdk.forProject(params.region, params.project).sites.get({ siteId: params.site })
    ]);

    return {
        site,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
