import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk.js';
import type { Attributes } from '../store.js';

export async function load({ depends, params }) {
    depends(Dependencies.COLLECTION);

    return {
        attributes:
            ((await sdk.forProject.databases.getCollection(params.database, params.collection))
                ?.attributes as unknown as Attributes[]) ?? []
    };
}
