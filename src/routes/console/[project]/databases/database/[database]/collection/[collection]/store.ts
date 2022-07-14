import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

type Attributes =
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
        load: async (collectionId: string) => {
            set(
                (await sdkForProject.databases.getCollection(collectionId)) as unknown as Collection
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

function createDocumentListStore() {
    const { subscribe, set } = writable<Models.DocumentList<Models.Document>>(
        browser ? JSON.parse(sessionStorage.getItem('documents')) : null
    );
    return {
        subscribe,
        set,
        load: async (collectionId: string, queries: [], limit: number, offset: number) => {
            const response = await sdkForProject.databases.listDocuments(
                collectionId,
                queries,
                limit,
                offset
            );
            set(response);
        }
    };
}

export const collection = createCollection();
export const documentList = createDocumentListStore();

if (browser) {
    collection.subscribe((n) => sessionStorage?.setItem('collection', JSON.stringify(n ?? '')));
    documentList.subscribe((n) => sessionStorage?.setItem('documentList', JSON.stringify(n ?? '')));
}
