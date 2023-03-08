import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.FILE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            file: await sdkForProject.storage.getFile(params.bucket, params.file)
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
