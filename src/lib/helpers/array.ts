export function intersection(arr1: unknown[], arr2: unknown[]) {
    const set = new Set(arr2);
    const intersection = new Set(arr1.filter((elem) => set.has(elem)));
    return Array.from(intersection);
}
export function difference(arr1: unknown[], arr2: unknown[]) {
    const set = new Set(arr2);
    const intersection = new Set(arr1.filter((elem) => !set.has(elem)));
    return Array.from(intersection);
}

export function symmetricDifference(arr1: unknown[], arr2: unknown[]) {
    return difference(arr1, arr2).concat(difference(arr2, arr1));
}
