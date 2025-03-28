import { createValueUnitPair } from '$lib/helpers/unit';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';

describe('createValueUnitPair', () => {
    const { value, unit, baseValue } = createValueUnitPair(1024, [
        { name: 'Bytes', value: 1 },
        { name: 'KB', value: 1024 },
        { name: 'MB', value: 1024 ** 2 },
        { name: 'GB', value: 1024 ** 3 }
    ]);

    it('should have correct initial state', () => {
        expect(get(value)).toEqual(1);
        expect(get(unit)).toEqual('KB');
        expect(get(baseValue)).toEqual(1024);
    });

    type Expected = {
        value: number;
        unit: string;
        baseValue: number;
    };

    type ValueTest = {
        value: number;
        expected: Expected;
    };

    type UnitTest = {
        unit: string;
        expected: Expected;
    };

    type Test = ValueTest | UnitTest;

    const tests: Test[] = [
        { value: 2, expected: { value: 2, unit: 'KB', baseValue: 2048 } },
        { value: 3, expected: { value: 3, unit: 'KB', baseValue: 3072 } },
        { value: 1024, expected: { value: 1024, unit: 'KB', baseValue: 1024 ** 2 } },
        { unit: 'MB', expected: { value: 1, unit: 'MB', baseValue: 1024 ** 2 } },
        { unit: 'GB', expected: { value: 1 / 1024, unit: 'GB', baseValue: 1024 ** 2 } },
        { value: 1, expected: { value: 1, unit: 'GB', baseValue: 1024 ** 3 } },
        { unit: 'Bytes', expected: { value: 1024 ** 3, unit: 'Bytes', baseValue: 1024 ** 3 } }
    ];

    tests.forEach((test) => {
        if ('value' in test) {
            it(`should update value and baseValue accordingly`, () => {
                value.set(test.value);
                expect(get(value)).toEqual(test.expected.value);
                expect(get(unit)).toEqual(test.expected.unit);
                expect(get(baseValue)).toEqual(test.expected.baseValue);
            });
        } else {
            it(`should update unit and value accordingly`, () => {
                unit.set(test.unit);
                expect(get(value)).toEqual(test.expected.value);
                expect(get(unit)).toEqual(test.expected.unit);
                expect(get(baseValue)).toEqual(test.expected.baseValue);
            });
        }
    });
});
