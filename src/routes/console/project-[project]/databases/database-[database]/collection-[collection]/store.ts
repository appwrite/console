import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';
import { isObjectType } from '$lib/helpers/object';

export type Attributes =
    | Models.AttributeBoolean
    | Models.AttributeEmail
    | Models.AttributeEnum
    | Models.AttributeFloat
    | Models.AttributeInteger
    | Models.AttributeIp
    | Models.AttributeString
    | Models.AttributeUrl;

export function isAttributeEnum(attribute: unknown): attribute is Models.AttributeEnum {
    return isObjectType<Models.AttributeEnum>(attribute, {
        format: (v) => v === 'enum'
    });
}

type Collection = Omit<Models.Collection, 'attributes'> & {
    attributes: Array<Attributes>;
};

export const collection = derived(page, ($page) => $page.data.collection as Collection);
export const attributes = derived(
    page,
    ($page) => $page.data.collection.attributes as Attributes[]
);
export const indexes = derived(page, ($page) => $page.data.collection.indexes as Models.Index[]);
