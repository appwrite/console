import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import type { Column as TableColumn } from '$lib/helpers/types';

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

export const tableColumns = writable<TableColumn[]>([]);

export const isCsvImportInProgress = writable(false);
