import { page } from '$app/stores';
import type { Models } from '@aw-labs/appwrite-console';
import { derived, writable } from 'svelte/store';

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
export type Column = {
    id: string;
    title: string;
    show: boolean;
    type?: string;
    direction?: string;
    width?: number;
};

export const collection = derived(page, ($page) => $page.data.collection as Collection);
export const attributes = derived(
    page,
    ($page) => $page.data.collection.attributes as Attributes[]
);
export const indexes = derived(page, ($page) => $page.data.collection.indexes as Models.Index[]);

export const columns = writable<Column[]>([]);
