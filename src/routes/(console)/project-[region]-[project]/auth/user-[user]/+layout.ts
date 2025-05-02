import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.USER);

    try {
        const [user, userFactors] = await Promise.all([
            sdk.forProject(params.region, params.project).users.get(params.user),
            sdk.forProject(params.region, params.project).users.listMfaFactors(params.user)
        ]);

        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            user,
            userFactors
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
