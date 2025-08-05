import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';
import type { SortDirection } from '$lib/components';

export type Columns =
    | Models.ColumnBoolean
    | Models.ColumnEmail
    | Models.ColumnEnum
    | Models.ColumnFloat
    | Models.ColumnInteger
    | Models.ColumnIp
    | Models.ColumnString
    | Models.ColumnUrl
    | (Models.ColumnRelationship & { default?: never });

type Table = Omit<Models.Table, 'columns'> & {
    columns: Array<Columns>;
};

export const table = derived(page, ($page) => $page.data.table as Table);
export const columns = derived(page, ($page) => $page.data.table.columns as Columns[]);
export const indexes = derived(page, ($page) => $page.data.table.indexes as Models.ColumnIndex[]);

export const tableColumns = writable<Column[]>([]);

export const isCsvImportInProgress = writable(false);

export const columnsOrder = writable<string[]>([]);
export const columnsWidth = writable<{
    [columnId: string]: { fixed: number | { min: number }; resized: number };
}>();

type DatabaseSheetOptions = {
    show: boolean;
    title?: string;
    column?: Columns;
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
        row: Models.Row;
    }
>({
    title: null,
    show: false,
    row: null
});

export const showRecordsCreateSheet = writable({
    show: false,
    row: null
});

export type SortState = {
    column?: string;
    direction: SortDirection;
};

export const sortState = writable<SortState>({
    column: null,
    direction: 'default'
});

export type ColumnDirection = {
    neighbour: string;
    to: 'left' | 'right';
};

export type CreateAttribute = {
    show: boolean;
    column?: Columns;
    title: string;
    direction?: ColumnDirection;
    onDone?: () => void;
    columns?: Column[];
    columnsOrder?: string[];
};

export const showCreateAttributeSheet = writable<CreateAttribute>({
    show: false,
    column: null,
    title: 'Create column',
    direction: null,
    onDone: null,
    columns: null,
    columnsOrder: null
});

export const showCreateIndexSheet = writable<{
    show: boolean;
    column?: string;
}>({
    show: false,
    column: null
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

export const spreadsheetLoading = writable(false);
