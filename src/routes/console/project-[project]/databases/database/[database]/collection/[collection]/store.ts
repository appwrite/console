import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
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

export const collection = cachedStore<
    Collection,
    {
        load: (databaseId: string, collectionId: string) => Promise<void>;
        addAttribute: (attribute: Attributes) => void;
        updateAttribute: (attribute: Attributes) => void;
        removeAttribute: (attribute: Attributes) => void;
    }
>('collection', function ({ set, update }) {
    return {
        load: async (databaseId, collectionId) => {
            set(
                (await sdkForProject.databases.getCollection(
                    databaseId,
                    collectionId
                )) as unknown as Collection
            );
        },
        addAttribute: (attribute) =>
            update((n) => {
                n.attributes.push(attribute);

                return n;
            }),
        updateAttribute: (attribute) =>
            update((n) => {
                const index = n.attributes.findIndex((a) => a.key === attribute.key);
                n.attributes[index] = attribute;

                return n;
            }),
        removeAttribute: (attribute) =>
            update((n) => {
                n.attributes = n.attributes.filter((a) => a.key !== attribute.key);

                return n;
            })
    };
});

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

/**
 * TODO: Mock proper types until the SKD is fixed.
 */
export type AttributeResponse = Omit<Models.AttributeList, 'attributes'> & {
    attributes: Attributes[];
};

export const attributeList = cachedStore<
    AttributeResponse,
    {
        load: (databaseId: string, collectionId: string) => Promise<void>;
    }
>('attributeList', function ({ set }) {
    return {
        load: async (databaseId, collectionId) => {
            const response: unknown = await sdkForProject.databases.listAttributes(
                databaseId,
                collectionId
            );

            set(response as AttributeResponse);
        }
    };
});
