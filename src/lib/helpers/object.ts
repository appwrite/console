/**
 * Strict typed `Object.entries`
 * Extracted from https://github.com/antfu/utils
 *
 * @category Object
 */
export function objectEntries<T extends object>(obj: T) {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

export function isRegExp(value: unknown): value is RegExp {
    return value instanceof RegExp;
}

/**
 * Creates a deep clone of the given object. This function uses the JSON methods for cloning,
 * so it may not be suitable for objects with functions, symbols, or other non-JSON-safe data.
 *
 * @param obj the object to be cloned
 * @returns a deep clone of the provided object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export type DeepObj<T> = {
    [K in keyof T]: T[K] extends object ? DeepObj<T[K]> : T[K];
};
export function deepMap<T, U>(
    obj: DeepObj<T>,
    fn: (value: T, key: string, parentKey?: string) => unknown,
    parentKey?: string
): U {
    const entries = objectEntries(obj);
    const result = {} as U;

    for (const [key, value] of entries) {
        if (typeof value === 'object' && value !== null) {
            result[key as any] = deepMap(value as any, fn, key as string) as any;
        } else {
            result[key as any] = fn(value as any, key as any, parentKey);
        }
    }

    return result;
}

export function parseIfString(value: unknown): any {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    return value;
}
