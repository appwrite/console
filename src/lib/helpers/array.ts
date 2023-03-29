export function intersection(arr1: unknown[], arr2: unknown[]) {
    const set = new Set(arr2);
    const intersection = new Set(arr1.filter((elem) => set.has(elem)));
    return Array.from(intersection);
}

export function difference(arr1: unknown[], arr2: unknown[]) {
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
    const len = array.length;
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
