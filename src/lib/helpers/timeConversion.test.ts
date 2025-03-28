import {
    calculateTime,
    timeToSeconds,
    timeToMinutes,
    secsToUnit
} from '$lib/helpers/timeConversion';
import { describe, expect, it } from 'vitest';

describe('Calculate time', () => {
    const tests: Array<[number, string]> = [
        [0.5, '500ms'],
        [1, '1s'],
        [1.5, '1s'],
        [59, '59s'],
        [60, '1m'],
        [61, '1m'],
        [119, '1m'],
        [120, '2m'],
        [121, '2m'],
        [3599, '59m'],
        [3600, '1h'],
        [3601, '1h'],
        [7199, '1h'],
        [7200, '2h'],
        [7201, '2h'],
        [86399, '23h'],
        [86400, '1d'],
        [86401, '1d'],
        [172799, '1d'],
        [172800, '2d'],
        [172801, '2d'],
        [2591999, '29d'],
        [2592000, '1M'],
        [2592001, '1M'],
        [31103999, '11M'],
        [31104000, '1y'],
        [31104001, '1y']
    ];

    tests.forEach(([input, expected]) => {
        it(`should return ${expected} for ${input}`, () => {
            expect(calculateTime(input)).toBe(expected);
        });
    });
});

describe('Time to seconds', () => {
    const tests: Array<{
        args: Parameters<typeof timeToSeconds>;
        expected: ReturnType<typeof timeToSeconds>;
    }> = [
        // ms
        { args: [0, 'ms'], expected: 0 },
        { args: [1000, 'ms'], expected: 1 },
        { args: [1000 * 60, 'ms'], expected: 60 },
        // seconds
        { args: [0, 's'], expected: 0 },
        { args: [1, 's'], expected: 1 },
        { args: [60, 's'], expected: 60 },
        // minutes
        { args: [0, 'm'], expected: 0 },
        { args: [1, 'm'], expected: 60 },
        { args: [60, 'm'], expected: 60 * 60 },
        // hours
        { args: [0, 'h'], expected: 0 },
        { args: [1, 'h'], expected: 60 * 60 },
        { args: [24, 'h'], expected: 60 * 60 * 24 },
        // days
        { args: [0, 'd'], expected: 0 },
        { args: [1, 'd'], expected: 60 * 60 * 24 },
        { args: [30, 'd'], expected: 60 * 60 * 24 * 30 },
        // months
        { args: [0, 'M'], expected: 0 },
        { args: [1, 'M'], expected: 60 * 60 * 24 * 30 },
        { args: [12, 'M'], expected: 60 * 60 * 24 * 30 * 12 },
        // years
        { args: [0, 'y'], expected: 0 },
        { args: [1, 'y'], expected: 60 * 60 * 24 * 30 * 12 },
        { args: [10, 'y'], expected: 60 * 60 * 24 * 30 * 12 * 10 }
    ];

    tests.forEach(({ args, expected }) => {
        it(`should return ${expected} for ${args}`, () => {
            expect(timeToSeconds(...args)).toBe(expected);
        });
    });
});

describe('Time to minutes', () => {
    const tests: Array<{
        args: Parameters<typeof timeToMinutes>;
        expected: ReturnType<typeof timeToMinutes>;
    }> = [
        // ms
        { args: [0, 'ms'], expected: 0 },
        { args: [1000 * 60, 'ms'], expected: 1 },
        { args: [1000 * 60 * 60, 'ms'], expected: 60 },
        // seconds
        { args: [0, 's'], expected: 0 },
        { args: [60, 's'], expected: 1 },
        { args: [60 * 60, 's'], expected: 60 },
        // minutes
        { args: [0, 'm'], expected: 0 },
        { args: [60, 'm'], expected: 60 },
        { args: [60 * 24, 'm'], expected: 60 * 24 },
        // hours
        { args: [0, 'h'], expected: 0 },
        { args: [1, 'h'], expected: 60 },
        { args: [24, 'h'], expected: 60 * 24 },
        // days
        { args: [0, 'd'], expected: 0 },
        { args: [1, 'd'], expected: 60 * 24 },
        { args: [30, 'd'], expected: 60 * 24 * 30 },
        // months
        { args: [0, 'M'], expected: 0 },
        { args: [1, 'M'], expected: 60 * 24 * 30 },
        { args: [12, 'M'], expected: 60 * 24 * 30 * 12 },
        // years
        { args: [0, 'y'], expected: 0 },
        { args: [1, 'y'], expected: 60 * 24 * 30 * 12 },
        { args: [2, 'y'], expected: 60 * 24 * 30 * 12 * 2 }
    ];

    tests.forEach(({ args, expected }) => {
        it(`should return ${expected} for ${args}`, () => {
            expect(timeToMinutes(...args)).toBe(expected);
        });
    });
});

describe('Seconds to unit', () => {
    const tests: Array<{
        args: Parameters<typeof secsToUnit>;
        expected: ReturnType<typeof secsToUnit>;
    }> = [
        // ms
        { args: [0, 'ms'], expected: 0 },
        { args: [1, 'ms'], expected: 1000 },
        { args: [60, 'ms'], expected: 60 * 1000 },
        // seconds
        { args: [0, 's'], expected: 0 },
        { args: [1, 's'], expected: 1 },
        { args: [60, 's'], expected: 60 },
        // minutes
        { args: [0, 'm'], expected: 0 },
        { args: [1, 'm'], expected: 1 / 60 },
        { args: [60, 'm'], expected: 1 },
        // hours
        { args: [0, 'h'], expected: 0 },
        { args: [1, 'h'], expected: 1 / 60 / 60 },
        { args: [60 * 60, 'h'], expected: 1 },
        // days
        { args: [0, 'd'], expected: 0 },
        { args: [1, 'd'], expected: 1 / 60 / 60 / 24 },
        { args: [60 * 60 * 24, 'd'], expected: 1 },
        // months
        { args: [0, 'M'], expected: 0 },
        { args: [1, 'M'], expected: 1 / 60 / 60 / 24 / 30 },
        { args: [60 * 60 * 24 * 30, 'M'], expected: 1 },
        // years
        { args: [0, 'y'], expected: 0 },
        { args: [1, 'y'], expected: 1 / 60 / 60 / 24 / 30 / 12 },
        { args: [60 * 60 * 24 * 30 * 12, 'y'], expected: 1 }
    ];

    tests.forEach(({ args, expected }) => {
        it(`should return ${expected} for ${args}`, () => {
            expect(secsToUnit(...args)).toBe(expected);
        });
    });
});
