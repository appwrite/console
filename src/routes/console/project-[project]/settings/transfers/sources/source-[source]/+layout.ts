import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.SOURCE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            source: await sdkForProject.transfers.getSource(params.source)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
