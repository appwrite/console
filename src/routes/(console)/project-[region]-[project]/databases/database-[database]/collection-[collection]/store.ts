import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
import type { SortState } from '$database/store';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import { SPREADSHEET_PAGE_LIMIT } from '$lib/constants';
import { createSparsePagedDataStore } from '@appwrite.io/pink-svelte';

export const indexes = derived(page, ($page) => $page.data.collection.indexes as Models.Index[]);

export const collectionColumns = writable<Column[]>([]);
export const isCollectionsCsvImportInProgress = writable(false);

export const paginatedDocumentsLoading = writable(false);
export const paginatedDocuments =
    createSparsePagedDataStore<Models.DefaultDocument>(SPREADSHEET_PAGE_LIMIT);

export const sortState = writable<SortState>({
    column: null,
    direction: 'default'
});

export const noSqlDocument = writable<{
    show: boolean;
    document?: Models.Document | (object & { $id?: string });
    isNew?: boolean;
    loading?: boolean;
    documentId?: string /* for loading from a given id */;
    hasDataChanged?: boolean;
}>({
    show: false,
    document: null,
    isNew: false,
    loading: false,
    documentId: null,
    hasDataChanged: false
});

export const documentPermissionSheet = writable({
    show: false,
    document: null as Models.Document
});

export const documentActivitySheet = writable({
    show: false,
    document: null as Models.Document
});
