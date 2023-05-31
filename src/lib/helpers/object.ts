/**
 * Strict typed `Object.entries`
 * Extracted from https://github.com/antfu/utils
 *
 * @category Object
 */
export function objectEntries<T extends object>(obj: T) {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Recursively compares two objects to see if they are equal. Returns true if they are equal, false otherwise.
 * @param obj1 the first object
 * @param obj2 the second object
 * @returns true if the objects are equal, false otherwise
 */
export function deepEqual<T>(obj1: T, obj2: T): boolean {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null)
        return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (
            !keys2.includes(key) ||
            !Object.prototype.hasOwnProperty.call(obj2, key) ||
            !deepEqual(obj1[key], obj2[key])
        )
            return false;
    }

    return true;
}

export function deepMap<T extends object, U extends object = T>(
    obj: T,
    fn: (value: unknown, key: unknown, obj: T) => unknown
): U {
    const entries = objectEntries(obj);
    const result = {} as U;

    for (const [key, value] of entries) {
        result[key] = typeof value === 'object' ? deepMap(value, fn) : fn(value, key, obj);
    }

    return result;
}
