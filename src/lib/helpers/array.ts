export function intersection(arr1: unknown[], arr2: unknown[]) {
    const set = new Set(arr2);
    const intersection = new Set(arr1.filter((elem) => set.has(elem)));
    return Array.from(intersection);
}

export function difference(arr1: unknown[], arr2: unknown[]) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return Array.isArray(arr1) ? arr1 : Array.isArray(arr2) ? arr2 : [];
    }
    const set = new Set(arr2);
    const difference = new Set(arr1.filter((elem) => !set.has(elem)));
    return Array.from(difference);
}

export function symmetricDifference(arr1: unknown[], arr2: unknown[]) {
    return difference(arr1, arr2).concat(difference(arr2, arr1));
}

/**
 * Removes the element at the specified index from the array, and returns a new array.
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @param {number} index
 * @returns {T[]}
 */
export function remove<T>(arr: T[], index: number): T[] {
    // Remove the element at the given index, return a new array
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Returns true if the array is empty, false otherwise.
 *
 * @export
 * @param {unknown[]} arr
 * @returns {boolean}
 */
export function empty(arr: unknown[]): boolean {
    if (!arr) return true;
    return arr.length === 0;
}

/**
 * Get nth item of Array. Negative for backward
 *
 * @export
 * @template T
 * @param {(readonly T[] | [])} array
 * @param {number} index
 * @returns {(T | undefined)}
 */
export function at(array: readonly [], index: number): undefined;
export function at<T>(array: readonly T[], index: number): T;
export function at<T>(array: readonly T[] | [], index: number): T | undefined {
    const len = array?.length;
    if (!len) return undefined;

    if (index < 0) index += len;

    return array[index];
}

/**
 * Get last item
 *
 * @export
 * @template T
 * @param {readonly T[]} array
 * @returns {(T | undefined)}
 */
export function last(array: readonly []): undefined;
export function last<T>(array: readonly T[]): T;
export function last<T>(array: readonly T[]): T | undefined {
    return at(array, -1);
}

export function excludeArray<T, E extends T>(
    array: readonly T[],
    exclude: readonly E[]
): Exclude<T, E>[] {
    return array.filter((item) => !exclude.includes(item as E)) as Exclude<T, E>[];
}

// Function that, given an array, checks if it includes all the elements of another array
export function includesAll<T>(arr1: T[], arr2: T[]): boolean {
    return arr2.every((elem) => arr1.includes(elem));
}

export function toggle<T>(arr: T[], elem: T): T[] {
    if (arr.includes(elem)) {
        return arr.filter((e) => e !== elem);
    }
    arr.push(elem);
    return arr;
}

// TODO: metric type is wrong
export function total(set: Array<number>): number {
    if (!set) return 0;
    return set.reduce((prev, curr) => prev + curr, 0);
}
