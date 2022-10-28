import { cachedStore } from '$lib/helpers/cache';
import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';

export const doc = cachedStore<
    Models.Document,
    {
        load: (databaseId: string, collectionId: string, documentId: string) => Promise<void>;
        addAttribute: (attribute: string) => void;
        removeAttribute: (attribute: string, index: number) => void;
    }
>('doc', function ({ set, update }) {
    return {
        load: async (databaseId, collectionId, documentId) =>
            set(await sdkForProject.databases.getDocument(databaseId, collectionId, documentId)),
        addAttribute: (attribute) =>
            update((n) => {
                n[attribute].push(null);

                return n;
            }),
        removeAttribute: (attribute, index) =>
            update((n) => {
                n[attribute].splice(index, 1);

                return n;
            })
    };
});
