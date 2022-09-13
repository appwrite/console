import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';
import { cachedStore } from '$lib/helpers/cache';

export type Attributes =
    | Models.AttributeBoolean
    | Models.AttributeEmail
    | Models.AttributeEnum
    | Models.AttributeFloat
    | Models.AttributeInteger
    | Models.AttributeIp
    | Models.AttributeString
    | Models.AttributeUrl;

type Collection = Omit<Models.Collection, 'attributes'> & {
    attributes: Array<Attributes>;
};

function createCollection() {
    const { subscribe, set, update } = writable<Collection>(
        browser ? JSON.parse(sessionStorage.getItem('collection')) : null
    );

    return {
        subscribe,
        set,
        load: async (databaseId: string, collectionId: string) => {
            set(
                (await sdkForProject.databases.getCollection(
                    databaseId,
                    collectionId
                )) as unknown as Collection
            );
        },
        addAttribute: (attribute: Attributes) =>
            update((n) => {
                n.attributes.push(attribute);

                return n;
            }),
        updateAttribute: (attribute: Attributes) =>
            update((n) => {
                const index = n.attributes.findIndex((a) => a.key === attribute.key);
                n.attributes[index] = attribute;

                return n;
            }),
        removeAttribute: (attribute: Attributes) =>
            update((n) => {
                n.attributes = n.attributes.filter((a) => a.key !== attribute.key);

                return n;
            })
    };
}

export const documentList = cachedStore<
    Models.DocumentList<Models.Document>,
    {
        load: (
            databaseId: string,
            collectionId: string,
            queries: [],
            limit: number,
            offset: number
        ) => Promise<void>;
    }
>('documentList', function ({ set }) {
    return {
        load: async (databaseId, collectionId, queries, limit, offset) => {
            const response = await sdkForProject.databases.listDocuments(
                databaseId,
                collectionId,
                queries,
                limit,
                offset
            );
            set(response);
        }
    };
});

export const indexList = cachedStore<
    Models.IndexList,
    {
        load: (databaseId: string, collectionId: string) => Promise<void>;
    }
>('indexList', function ({ set }) {
    return {
        load: async (databaseId: string, collectionId: string) => {
            const response = await sdkForProject.databases.listIndexes(databaseId, collectionId);
            set(response);
        }
    };
});

export const attributeList = cachedStore<
    Models.AttributeList,
    {
        load: (databaseId: string, collectionId: string) => Promise<void>;
    }
>('attributeList', function ({ set }) {
    return {
        load: async (databaseId, collectionId) => {
            const response = await sdkForProject.databases.listAttributes(databaseId, collectionId);
            set(response);
        }
    };
});

export const collection = createCollection();

if (browser) {
    collection.subscribe((n) => sessionStorage?.setItem('collection', JSON.stringify(n ?? '')));
}
