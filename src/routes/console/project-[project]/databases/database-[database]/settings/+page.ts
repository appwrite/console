import { get } from 'svelte/store';
import { Dependencies } from '$lib/constants';
import { collections as collectionsStore } from '../store';
import { sdk } from '$lib/stores/sdk';

export async function load({ depends, params }) {
    depends(Dependencies.COLLECTIONS);

    let collections = get(collectionsStore);

    if (collections.total === 0) {
        collections = await sdk.forProject.databases.listCollections(params.database);
        collectionsStore.set(collections);
    }

    return { collections };
}
