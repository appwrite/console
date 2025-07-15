import type { ComponentType } from 'svelte';
import type { Writable } from 'svelte/store';

export type PinkColumn = {
    id: string;
    width?:
        | {
              min: number;
              max: number;
          }
        | {
              min: number;
          }
        | number;
    hide?: boolean;
};

export type PinkSheetColumn = {
    id: string;
    width?:
        | {
              min: number;
              max: number;
          }
        | {
              min: number;
          }
        | number;
    hide?: boolean;
    fixed?: boolean;
    resizable?: boolean;
    draggable?: boolean;
    resizedWidth?: number;
    isAction?: boolean;
};

export type WritableValue<T> = T extends Writable<infer U> ? U : never;

export function isHTMLElement(el: unknown): el is HTMLElement {
    return el instanceof HTMLElement;
}

export function isHTMLInputElement(el: unknown): el is HTMLInputElement {
    return el instanceof HTMLInputElement;
}

export type Prettify<T> = T & {};

const columnTypes = [
    'string',
    'integer',
    'double',
    'boolean',
    'datetime',
    'relationship',
    'enum'
] as const;
export type SheetColumnType = (typeof columnTypes)[number];
export type SheetColumn = PinkSheetColumn & {
    title: string;
    type: SheetColumnType;
    filter?: boolean;
    array?: boolean;
    format?: string;
    exclude?: boolean;
    elements?: string[] | { value: string | number; label: string }[];
    encrypt?: boolean;
    icon?: ComponentType;
    isPrimary?: boolean;
    isEditable?: boolean;
};

export function isValueOfStringEnum<T extends Record<string, string>>(
    enumType: T,
    value: string
): value is T[keyof T] {
    return Object.values<string>(enumType).includes(value);
}

export type TableRootProp = {
    allowSelection: boolean;
    selectedRows: string[];
    selectedAll: boolean;
    selectedNone: boolean;
    selectedSome: boolean;
    columns: Array<PinkColumn> | number;
    columnsMap: Record<PinkColumn['id'], PinkColumn>;
    toggle: (id: string) => void;
    toggleAll: () => void;
    addAvailableId: (id: string) => void;
    removeAvailableId: (id: string) => void;
};
