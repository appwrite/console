import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';

export const load = async ({ depends, params }) => {
    depends(Dependencies.SITE);
    try {
        const [site] = await Promise.all([
            sdk.forProject(params.region, params.project).sites.get(params.site)
        ]);

        return {
            site,
            header: Header,
            breadcrumbs: Breadcrumbs
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
