import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error, redirect } from '@sveltejs/kit';
import { APPWRITE_OFFICIALS_ORG, isCloud } from '$lib/system';
import { organization } from '$lib/stores/organization';
import { get } from 'svelte/store';
import { base } from '$app/paths';

export const load = async ({ depends, params }) => {
    // don't load anything on cloud unless org is appwrite atm!
    if (isCloud && get(organization)?.$id !== APPWRITE_OFFICIALS_ORG) {
        redirect(307, `${base}/project-${params.region}-${params.project}/sites`);
    }

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
