import {
    at,
    difference,
    empty,
    intersection,
    last,
    remove,
    symmetricDifference
} from '$lib/helpers/array';
import { describe, expect, it, test } from 'vitest';

const tests = [
    {
        arr1: [1, 2, 3],
        arr2: [2, 3, 4],
        expectedIntersection: [2, 3],
        expectedDifference: [1],
        expectedSymmetricDifference: [1, 4]
    },
    {
        arr1: ['a', 'b', 'c'],
        arr2: ['b', 'c', 'd'],
        expectedIntersection: ['b', 'c'],
        expectedDifference: ['a'],
        expectedSymmetricDifference: ['a', 'd']
    },
    {
        arr1: [1, 'a', { key: 'value' }],
        arr2: ['a', { key: 'value' }, 1],
        expectedIntersection: [1, 'a'],
        expectedDifference: [{ key: 'value' }],
        expectedSymmetricDifference: [{ key: 'value' }, { key: 'value' }]
    },
    {
        arr1: [],
        arr2: [1, 2, 3],
        expectedIntersection: [],
        expectedDifference: [],
        expectedSymmetricDifference: [1, 2, 3]
    },
    {
        arr1: [1, 2, 3],
        arr2: [],
        expectedIntersection: [],
        expectedDifference: [1, 2, 3],
        expectedSymmetricDifference: [1, 2, 3]
    },
    {
        arr1: [1, 2, 3],
        arr2: [4, 5, 6],
        expectedIntersection: [],
        expectedDifference: [1, 2, 3],
        expectedSymmetricDifference: [1, 2, 3, 4, 5, 6]
    }
];

//
// INTERSECTION
//
tests.forEach((test, index) => {
    it(`should find the intersection of arrays - test case #${index + 1}`, () => {
        const result = intersection(test.arr1, test.arr2);
        expect(result).toEqual(test.expectedIntersection);
    });
});

//
// DIFFERENCE
//

tests.forEach((test, index) => {
    it(`should find the difference of arrays - test case #${index + 1}`, () => {
        const result = difference(test.arr1, test.arr2);
        expect(result).toEqual(test.expectedDifference);
    });
});

//
// SYMMETRIC DIFFERENCE
//

tests.forEach((test, index) => {
    it(`should find the symmetric difference of arrays - test case #${index + 1}`, () => {
        const result = symmetricDifference(test.arr1, test.arr2);
        expect(result).toEqual(test.expectedSymmetricDifference);
    });
});

//
// REMOVE
//

describe('remove function', () => {
    test('removes an element at a specific index', () => {
        const arr = [1, 2, 3, 4];
        const index = 2;
        const expectedArr = [1, 2, 4];
        expect(remove(arr, index)).toEqual(expectedArr);
    });

    test('returns the same array if the index is out of range', () => {
        const arr = [1, 2, 3, 4];
        const index = 10;
        expect(remove(arr, index)).toEqual(arr);
    });

    test('returns an empty array if the input array is empty', () => {
        const arr: number[] = [];
        const index = 0;
        expect(remove(arr, index)).toEqual([]);
    });
});

//
// EMPTY
//

describe('empty function', () => {
    test('returns true for an empty array', () => {
        expect(empty([])).toBe(true);
    });

    test('returns true for undefined input', () => {
        expect(empty(undefined)).toBe(true);
    });

    test('returns true for null input', () => {
        expect(empty(null)).toBe(true);
    });

    test('returns false for a non-empty array', () => {
        expect(empty([1, 2, 3])).toBe(false);
    });
});

//
// AT
//

describe('at function', () => {
    test('returns undefined for an empty array', () => {
        expect(at([], 0)).toBeUndefined();
    });

    test('returns undefined when index is out of bounds', () => {
        expect(at([1, 2, 3], 10)).toBeUndefined();
        expect(at([1, 2, 3], -4)).toBeUndefined();
    });

    test('returns correct value for a positive index', () => {
        expect(at([1, 2, 3], 1)).toBe(2);
        expect(at(['a', 'b', 'c'], 2)).toBe('c');
    });

    test('returns correct value for a negative index', () => {
        expect(at([1, 2, 3], -1)).toBe(3);
        expect(at(['a', 'b', 'c'], -2)).toBe('b');
    });

    test('works for arrays with mixed types', () => {
        expect(at([1, 'two', false], 1)).toBe('two');
    });

    test('works for readonly arrays', () => {
        const readonlyArray: readonly number[] = [1, 2, 3];
        expect(at(readonlyArray, 0)).toBe(1);
    });
});

//
// LAST
//
describe('last function', () => {
    test('returns undefined for an empty array', () => {
        expect(last([])).toBeUndefined();
    });

    test('returns the last element of an array with a single element', () => {
        expect(last([1])).toBe(1);
    });

    test('returns the last element of a multi-element array', () => {
        expect(last([1, 2, 3])).toBe(3);
    });

    test('works with arrays of mixed types', () => {
        expect(last(['a', 1, true])).toBe(true);
    });

    test('works with readonly arrays', () => {
        const readonlyArray: readonly number[] = [1, 2, 3];
        expect(last(readonlyArray)).toBe(3);
    });
});
