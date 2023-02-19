import '@testing-library/jest-dom';
import {
    toLocaleDate,
    toLocaleDateTime,
    isSameDay,
    isValidDate,
    diffDays
} from '$lib/helpers/date';

describe('local date', () => {
    [
        ['2022-11-15 08:26:28', 'Nov 15, 2022'],
        ['2022-11-15 00:26:28', 'Nov 15, 2022']
    ].forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDate(value)).toBe(expected);
        });
    });
});

describe('local date time', () => {
    [
        ['2022-11-15 08:26:28', 'Nov 15, 2022, 08:26'],
        ['2022-11-15 00:26:28', 'Nov 15, 2022, 00:26']
    ].forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDateTime(value)).toBe(expected);
        });
    });
});

describe('is same day', () => {
    const entries: Array<[string, string, boolean]> = [
        ['2022-11-15 08:26:28', '2022-11-15 08:26:28', true],
        ['2022-11-15 08:26:28', '2022-11-16 08:26:28', false],
        ['2022-11-15 08:26:28', '2022-11-15 08:26:29', true],
        ['2022-11-15 08:26:28', '2022-11-15 08:26:27', true]
    ];

    entries.forEach(([value1, value2, expected]) => {
        it(`${value1} ${value2}`, () => {
            expect(isSameDay(new Date(value1), new Date(value2))).toBe(expected);
        });
    });
});

describe('is valid date', () => {
    const entries: Array<[string, boolean]> = [
        ['2022-11-15 08:26:28', true],
        ['2022-11-15 08:26:28', true],
        ['abc', false],
        ['2022-11-15', true],
        ['123.123.123', false]
    ];

    entries.forEach(([value, expected]) => {
        it(value, () => {
            expect(isValidDate(value)).toBe(expected);
        });
    });
});

describe('diff days', () => {
    const entries: Array<[string, string, number]> = [
        ['2022-11-15 08:26:28', '2022-11-15 08:26:28', 0],
        ['2022-11-15 08:26:28', '2022-11-16 08:26:28', 1],
        ['2022-11-15 08:26:28', '2022-11-16 08:26:27', 0],
        ['2022-11-15 08:26:28', '2022-11-14 08:26:29', 0],
        ['2022-11-15 08:26:28', '2022-11-14 08:26:27', 1],
        ['2022-11-15 08:26:28', '2022-11-20 08:26:29', 5],
        ['2022-11-15 08:26:28', '2022-11-20 08:26:27', 4]
    ];

    entries.forEach(([value1, value2, expected]) => {
        it(`${value1} ${value2}`, () => {
            expect(diffDays(new Date(value1), new Date(value2))).toBe(expected);
        });
    });
});
