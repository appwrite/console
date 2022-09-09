export function intersection(arr1: any[], arr2: any[]) {
    const set = new Set(arr2);
    const intersection = new Set(arr1.filter((elem) => set.has(elem)));
    return Array.from(intersection);
}
export function difference(arr1: any[], arr2: any[]) {
    const set = new Set(arr2);
    const intersection = new Set(arr1.filter((elem) => !set.has(elem)));
    return Array.from(intersection);
}
