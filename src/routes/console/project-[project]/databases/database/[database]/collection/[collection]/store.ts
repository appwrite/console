import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

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
    const { subscribe, set, update } = writable<Collection>();

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

export const collection = createCollection();
