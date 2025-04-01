import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FILE);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            file: await sdk
                .forProject(params.region, params.project)
                .storage.getFile(params.bucket, params.file)
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
