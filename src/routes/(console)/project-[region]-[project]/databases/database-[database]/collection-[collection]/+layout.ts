import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import SubNavigation from './subNavigation.svelte';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.COLLECTION);

    const [collection, allCollections] = await Promise.all([
        sdk
            .forProject(params.region, params.project)
            .databases.getCollection(params.database, params.collection),
        sdk
            .forProject(params.region, params.project)
            .databases.listCollections(params.database, [Query.orderDesc(''), Query.limit(100)])
    ]);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        subNavigation: SubNavigation,
        collection,
        allCollections
    };
};
