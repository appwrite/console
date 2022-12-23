type Stringifiable = string | number | boolean | null | undefined;

// Provides a method with typed keys for Object.keys
export function objectKeys<O extends object>(object: O) {
    return Object.keys(object) as Array<`${keyof O & Stringifiable}`>;
}

/**
 * Strict typed `Object.entries`
 * Extracted from https://github.com/antfu/utils
 *
 * @category Object
 */
export function objectEntries<T extends object>(obj: T) {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

export function objectFromEntries<K extends PropertyKey, V>(entries: Array<[K, V]>): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>;
}

export function objectFilter<O extends object>(
    object: O,
    predicate: (key: keyof O, value: O[keyof O]) => boolean
): Partial<O> {
    return Object.fromEntries(
        Object.entries(object).filter(([key, value]) =>
            predicate(key as keyof O, value as O[keyof O])
        )
    ) as Partial<O>;
}

export function objectMapKeys<O extends object>(
    obj: O,
    fn: (key: string, val: O[keyof O], obj: O) => string
): Record<string, O[keyof O]> {
    const result: Record<string, O[keyof O]> = {};

    objectKeys(obj).reduce((acc, k) => {
        acc[fn(k, obj[k as keyof O], obj)] = obj[k as keyof O];

        return acc;
    }, result);

    return result;
}
