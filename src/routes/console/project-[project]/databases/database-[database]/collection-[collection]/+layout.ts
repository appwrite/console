import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.COLLECTION);
    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            collection: await sdk.forProject.databases.getCollection(
                params.database,
                params.collection
            )
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
