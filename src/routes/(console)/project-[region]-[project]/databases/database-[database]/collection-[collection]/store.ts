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

export const databaseSheetOptions = writable<DatabaseSheetOptions>({
    title: null,
    show: false,
    column: null,
    isEdit: false,
    disableSubmit: false,
    submitAction: null
});

export const sortState = writable({
    column: null as string,
    direction: 'default' as SortDirection
});
