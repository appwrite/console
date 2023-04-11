import { deepEqual, objectEntries } from '$lib/helpers/object';

test('objectEntries', () => {
    const object = {
        a: 1,
        b: 2,
        c: 3
    };

    expect(objectEntries(object)).toEqual(Object.entries(object));
});

test('deepEqual function returns true for equal objects', () => {
    const obj1 = { a: 1, b: { c: [1, 2, 3] } };
    const obj2 = { a: 1, b: { c: [1, 2, 3] } };

    expect(deepEqual(obj1, obj2)).toBe(true);
});

test('deepEqual function returns false for unequal objects', () => {
    const obj1 = { a: 1, b: { c: [1, 2, 3] } };
    const obj2 = { a: 1, b: { c: [1, 2, 4] } };

    expect(deepEqual(obj1, obj2)).toBe(false);
});

test('deepEqual function returns false for objects with different keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, c: 2 };

    expect(deepEqual<Record<string, unknown>>(obj1, obj2)).toBe(false);
});
