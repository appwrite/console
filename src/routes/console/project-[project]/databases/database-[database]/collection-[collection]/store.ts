import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';

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

export const collection = derived(page, ($page) => $page.data.collection as Collection);
export const attributes = derived(
    page,
    ($page) => $page.data.collection.attributes as Attributes[]
);
