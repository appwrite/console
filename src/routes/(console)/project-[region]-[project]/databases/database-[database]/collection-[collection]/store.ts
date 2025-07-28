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
export const columnsOrder = writable<string[]>([]);
export const columnsWidth = writable<{
    [columnId: string]: { fixed: number | { min: number }; resized: number };
}>();

export const isCsvImportInProgress = writable(false);

type DatabaseSheetOptions = {
    show: boolean;
    title?: string;
    column?: Attributes;
    isEdit?: boolean;
    disableSubmit?: boolean;
    submitAction?: () => Promise<void>;
    direction?: ColumnDirection;
};

export const databaseColumnSheetOptions = writable<DatabaseSheetOptions>({
    title: null,
    show: false,
    column: null,
    isEdit: false,
    disableSubmit: false,
    submitAction: null,
    direction: null
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

export type ColumnDirection = {
    neighbour: string;
    to: 'left' | 'right';
};

export type CreateAttribute = {
    show: boolean;
    column?: string;
    title: string;
    direction?: ColumnDirection;
    onDone?: () => void;
    columns?: Column[];
    columnsOrder?: string[];
};

export const showCreateAttributeSheet = writable<CreateAttribute>({
    show: false,
    column: null,
    title: 'Insert column',
    direction: null,
    onDone: null,
    columns: null,
    columnsOrder: null
});

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

export const randomDataModalState = writable({
    show: false,
    value: 25 // initial value!
});
