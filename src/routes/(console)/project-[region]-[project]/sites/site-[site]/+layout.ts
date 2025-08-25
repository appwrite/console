import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ depends, params }) => {
    depends(Dependencies.SITE);
    const [site] = await Promise.all([
        sdk.forProject(params.region, params.project).sites.get({ siteId: params.site })
    ]);

    return {
        site,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
