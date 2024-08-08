import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.BUCKET);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            bucket: await sdk.forProject.storage.getBucket(params.bucket)
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
