import { writable } from 'svelte/store';
import { IndexType } from '@appwrite.io/console';
import { columnOptions } from '../table-[table]/columns/store';

export type TableColumnSuggestions = {
    force: boolean;
    enabled: boolean;
    thinking: boolean;
    context?: string | undefined;

    /* for safety when in tables page */
    table?: {
        id: string;
        name: string;
    };
};

export type SuggestedColumnSchema = {
    key: string;
    type: string;
    required: boolean;
    array?: boolean;
    default?: string | number | boolean | number[] | number[][] | number[][][] | null;
    size?: number;
    min?: number;
    max?: number;
    format?: string | null;
    encrypt?: boolean | null;
    elements?: string[];
    isPlaceholder?: boolean;
};

export enum IndexOrder {
    ASC = 'ASC',
    DESC = 'DESC',
    NONE = null
}

export type SuggestedIndexSchema = {
    key: string;
    type: IndexType;
    orders: IndexOrder;
    columns: string[];
    lengths?: number[] | undefined;
};

export const tableColumnSuggestions = writable<TableColumnSuggestions>({
    enabled: false,
    context: null,
    thinking: false,
    table: null,
    force: false
});

export const showIndexesSuggestions = writable<boolean>(false);

export const showColumnsSuggestionsModal = writable<boolean>(false);

export const mockSuggestions: { total: number; columns: ColumnInput[] } = {
    total: 7,
    columns: [
        {
            name: 'title',
            type: 'string',
            size: 255,
            format: null,
            required: true,
            formatOptions: null
        },
        {
            name: 'productionCompany',
            type: 'string',
            size: 128,
            format: null,
            required: true,
            formatOptions: null
        },
        {
            name: 'year',
            type: 'integer',
            size: null,
            format: null,
            required: true,
            formatOptions: {
                min: 1500,
                max: null
            }
        },
        {
            name: 'category',
            type: 'string',
            size: 64,
            format: null,
            required: false,
            formatOptions: null,
            default: null
        },
        {
            name: 'code',
            type: 'string',
            size: 13,
            required: false,
            formatOptions: null,
            default: null
        },
        {
            name: 'spokenLanguage',
            type: 'string',
            size: 32,
            format: null,
            required: false,
            formatOptions: null,
            default: null
        },
        {
            name: 'count',
            type: 'integer',
            required: false,
            min: 1,
            max: 10000,
            default: null
        }
    ]
};
export type ColumnInput = {
    name: string;
    type: string;
    required?: boolean;
    default?: string | number | boolean | number[] | number[][] | number[][][] | null;
    size?: number;
    min?: number;
    max?: number;
    format?: string;
    elements?: string[];
    formatOptions?: {
        min?: number;
        max?: number;
    };
};

export function mapSuggestedColumns<T extends ColumnInput>(columns: T[]): SuggestedColumnSchema[] {
    return columns.map((col) => ({
        key: col.name,
        type: col.type,
        required: col.required ?? false,
        array: false,
        default: col.default ?? null,
        size: col.type === 'string' ? (col.size ?? undefined) : undefined,
        min:
            col.type === 'integer' || col.type === 'double'
                ? (col.min ?? col.formatOptions?.min ?? undefined)
                : undefined,
        max:
            col.type === 'integer' || col.type === 'double'
                ? (col.max ?? col.formatOptions?.max ?? undefined)
                : undefined,
        format: col.format ?? null,
        elements: col.elements ?? undefined
    }));
}

export const basicColumnOptions = columnOptions.slice(0, -1);
