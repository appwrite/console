import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import type { SortDirection } from '$lib/components/sortButton.svelte';

export type Attributes =
    | Models.AttributeBoolean
    | Models.AttributeEmail
    | Models.AttributeEnum
    | Models.AttributeFloat
    | Models.AttributeInteger
    | Models.AttributeIp
    | Models.AttributeString
    | Models.AttributeUrl
    | (Models.AttributeRelationship & { default?: never });

type Collection = Omit<Models.Collection, 'attributes'> & {
    attributes: Array<Attributes>;
};

export const collection = derived(page, ($page) => $page.data.collection as Collection);
export const attributes = derived(
    page,
    ($page) => $page.data.collection.attributes as Attributes[]
);
export const indexes = derived(page, ($page) => $page.data.collection.indexes as Models.Index[]);

export const columns = writable<Column[]>([]);

export const isCsvImportInProgress = writable(false);

type DatabaseSheetOptions = {
    show: boolean;
    title?: string;
    column?: Attributes;
    isEdit?: boolean;
    disableSubmit?: boolean;
    submitAction?: () => Promise<void>;
};

export const databaseColumnSheetOptions = writable<DatabaseSheetOptions>({
    title: null,
    show: false,
    column: null,
    isEdit: false,
    disableSubmit: false,
    submitAction: null
});

export const databaseRowSheetOptions = writable<
    DatabaseSheetOptions & {
        document: Models.Document;
    }
>({
    title: null,
    show: false,
    document: null
});

export const showRecordsCreateSheet = writable({
    show: false,
    document: null
});

export const sortState = writable({
    column: null as string,
    direction: 'default' as SortDirection
});

export const showCreateAttributeSheet = writable(false);

export function reorderItems<T extends { id: string } | { key: string }>(
    items: T[],
    order: string[] = []
): T[] {
    if (!order.length) return items;

    const getItemId = (item: T): string => {
        return 'id' in item ? item.id : item.key;
    };

    const itemMap = Object.fromEntries(items.map((item) => [getItemId(item), item]));
    const orderSet = new Set(order);

    return [
        ...(order.map((id) => itemMap[id]).filter(Boolean) as T[]),
        ...items.filter((item) => !orderSet.has(getItemId(item)))
    ];
}
