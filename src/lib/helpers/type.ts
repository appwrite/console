import { objectEntries } from './object';

export type Nullable<T> = T | null | undefined;

export function isNonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

export type NonNullableObject<T> = {
    [P in keyof T]-?: NonNullable<T[P]>;
};

export function isNonNullableObject<T>(value: T): value is NonNullableObject<T> {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.values(value).every((v) => v !== null && v !== undefined)
    );
}

export function getIfNonNullableObject<T>(value: T): NonNullableObject<T> | undefined {
    return isNonNullableObject(value) ? value : undefined;
}

export type StringObject<T> = {
    [P in keyof T]-?: string;
};

export function getIfStringObject<T>(value: T): StringObject<T> | undefined {
    return isNonNullableObject(value) && Object.values(value).every(isString)
        ? (value as StringObject<T>)
        : undefined;
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

export function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
}

export function isTypeArray<T>(
    values: unknown,
    checker: (value: unknown) => value is T
): values is T[] {
    return Array.isArray(values) && values.every(checker);
}

export function isStringArray(values: unknown): values is string[] {
    return isTypeArray(values, isString);
}

type TypeofTypes =
    | 'undefined'
    | 'object'
    | 'boolean'
    | 'number'
    | 'bigint'
    | 'string'
    | 'symbol'
    | 'function';

type KeyTypesMap<T> = Record<keyof T, Array<TypeofTypes> | ((v: unknown) => boolean) | TypeofTypes>;

/**
 * Checks if the given value is an object of type T, given a map of keys and
 * their types/validators.
 * @date 9/27/2022 - 11:20:54 AM
 *
 * @category Object
 *
 * @template T
 * @param {unknown} object
 * @param {KeyTypesMap} keyTypesMap
 * @returns {value is T}
 *
 * @example
 * ```
 * type ExampleType = {
 *   a: string;
 *   b: number;
 *   c: string | number;
 *   d: string[]
 *   e: {
 *     f: string;
 *     g: number;
 *   }
 * }
 *
 * export const isExampleType = (value: unknown): value is ExampleType => {
 *   return isObjectType(value, {
 *     a: 'string',
 *     b: 'number',
 *     c: ['string', 'number'],
 *     d: (v) => Array.isArray(v) && v.every((v) => typeof v === 'string'),
 *     e: (v) => isObjectType(v, {
 *       f: 'string',
 *       g: 'number',
 *     }),
 *   });
 * };
 * ```
 */
export const isObjectType = <T>(
    object: unknown,
    keyTypesMap: Partial<KeyTypesMap<T>>
): object is T => {
    if (typeof object !== 'object' || object === null) {
        return false;
    }

    for (const [key, check] of objectEntries(keyTypesMap)) {
        const value = (object as Record<keyof T, unknown>)[key];

        if (typeof check === 'function') {
            if (!check(value)) {
                return false;
            }
        } else if (typeof check === 'string') {
            if (typeof value !== check) {
                return false;
            }
        } else if (!check?.includes(typeof value)) {
            return false;
        }
    }

    return true;
};
