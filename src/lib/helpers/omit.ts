export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
    const ret = { ...obj };
    for (const key of keys) {
        delete ret[key];
    }
    return ret;
}
