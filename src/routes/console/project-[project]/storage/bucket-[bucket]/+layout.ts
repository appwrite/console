import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.BUCKET);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            bucket: await sdkForProject.storage.getBucket(params.bucket)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
