import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';
import SubNavigation from './subNavigation.svelte';
import { Query } from '@appwrite.io/console';
import { preferences } from '$lib/stores/preferences';

export const load: LayoutLoad = async ({ params, depends }) => {
    await preferences.loadTeamPrefs();
    depends(Dependencies.COLLECTION);
    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            collection: await sdk.forProject.databases.getCollection(
                params.database,
                params.collection
            ),
            subNavigation: SubNavigation,
            allCollections: await sdk.forProject.databases.listCollections(params.database, [
                Query.orderDesc('$createdAt')
            ])
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
