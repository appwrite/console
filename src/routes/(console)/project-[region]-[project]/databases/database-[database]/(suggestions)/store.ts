import { writable } from 'svelte/store';

export type TableColumnSuggestions = {
    enabled: boolean;
    thinking: boolean;
    context?: string | undefined;

    /* for safety when in tables page */
    table: {
        id: string;
        name: string;
    };
};

export type SuggestedColumnSchema = {
    key: string;
    type: string;
    required: boolean;
    default?: string | number | boolean | number[] | number[][] | number[][][] | null;
    size?: number;
    min?: number;
    max?: number;
    format?: string | null;
};

export const tableColumnSuggestions = writable<TableColumnSuggestions>({
    enabled: false,
    context: null,
    thinking: false,
    table: null
});

export type ColumnInput = {
    name: string;
    type: string;
    required?: boolean;
    default?: string | number | boolean | number[] | number[][] | number[][][] | null;
    size?: number;
    min?: number;
    max?: number;
    format?: string;
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
        format: col.format ?? null
    }));
}
