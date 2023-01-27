/**
 * Strict typed `Object.entries`
 * Extracted from https://github.com/antfu/utils
 *
 * @category Object
 */
export function objectEntries<T extends object>(obj: T) {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

type KeyTypesMap<T> = Record<keyof T, Array<string> | ((v: unknown) => boolean) | string>;
/**
 * Checks if the given value is an object of type T, given a map of keys and
 * their types/validators.
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
        } else if (!check.includes(typeof value)) {
            return false;
        }
    }

    return true;
};
