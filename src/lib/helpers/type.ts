export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
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
