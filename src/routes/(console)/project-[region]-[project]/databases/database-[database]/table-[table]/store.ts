import { page } from '$app/stores';
import type { Column, ColumnType } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';
import type { SortDirection } from '$lib/components';
import { SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
import { createSparsePagedDataStore } from '@appwrite.io/pink-svelte';

export type Columns =
    | Models.ColumnBoolean
    | Models.ColumnEmail
    | Models.ColumnEnum
    | Models.ColumnFloat
    | Models.ColumnInteger
    | Models.ColumnIp
    | Models.ColumnString
    | Models.ColumnUrl
    | Models.ColumnPoint
    | Models.ColumnLine
    | Models.ColumnPolygon
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

export type ColumnsWidth = {
    [columnId: string]: { fixed: number | { min: number }; resized: number };
};

export const columnsWidth = writable<ColumnsWidth>();

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
        rowId?: string;
        autoFocus?: boolean;
    }
>({
    title: null,
    show: false,
    row: null,
    rowId: null, // for loading from a given id
    autoFocus: true
});

export const databaseRelatedRowSheetOptions = writable<
    DatabaseSheetOptions & {
        rows: string | Models.Row[];
        tableId: string;
    }
>({
    title: 'Update related row',
    show: false,
    rows: null,
    tableId: null
});

export const showRowCreateSheet = writable({
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

export type CreateColumn = {
    show: boolean;
    column?: Columns;
    title: string;
    direction?: ColumnDirection;
    onDone?: () => void;
    columns?: Column[];
    columnsOrder?: string[];
};

export const showCreateColumnSheet = writable<CreateColumn>({
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

// noinspection JSUnusedGlobalSymbols
export enum Deletion {
    setNull = 'Set row ID as NULL in all related rows',
    cascade = 'All related rows will be deleted',
    restrict = 'Row can not be deleted'
}

export const scrollStore = writable(null);

export const rowActivitySheet = writable({
    show: false,
    row: null as Models.Row
});

export const rowPermissionSheet = writable({
    show: false,
    row: null as Models.Row
});

export const expandTabs = writable(null);
export const spreadsheetRenderKey = writable('initial');

export const paginatedRowsLoading = writable(false);
export const paginatedRows = createSparsePagedDataStore<Models.DefaultRow>(SPREADSHEET_PAGE_LIMIT);

export const PROHIBITED_ROW_KEYS = [
    '$id',
    '$sequence',
    '$collection',
    '$tableId',
    '$databaseId',
    '$createdAt',
    '$updatedAt'
];

export const sheetHeightStore = writable('74.5vh');

export const getDefaultSpatialData = (
    type: Extract<ColumnType, 'point' | 'linestring' | 'polygon'>
) => {
    if (type === 'point') return [0, 0];
    else if (type === 'linestring')
        return [
            [0, 0],
            [0, 0]
        ];
    else if (type === 'polygon')
        return [
            [
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 0]
            ]
        ];
};

export const getSingleRingPolygon = () => {
    return [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
    ];
};
