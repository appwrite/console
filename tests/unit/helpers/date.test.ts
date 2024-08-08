import { describe, expect, it } from 'vitest';
import type { WeekDay } from '$lib/helpers/date';
import {
    toLocaleDate,
    toLocaleDateTime,
    isSameDay,
    isValidDate,
    diffDays,
    toLocaleDateISO,
    toLocaleTimeISO,
    utcHourToLocaleHour,
    utcWeekDayToLocaleWeekDay
} from '$lib/helpers/date';

describe('local date', () => {
    [
        ['2022-11-15 08:26:28', 'Nov 15, 2022'],
        ['2022-11-15 00:26:28', 'Nov 15, 2022'],
        ['2022-11-15 00:26:28Z', 'Nov 14, 2022']
    ].forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDate(value)).toBe(expected);
        });
    });

    it('invalid date', () => {
        expect(toLocaleDate('')).toBe('n/a');
    });
});

describe('local date time', () => {
    [
        ['2022-11-15 08:26:28', 'Nov 15, 2022, 08:26'],
        ['2022-11-15 00:26:28', 'Nov 15, 2022, 00:26'],
        ['2022-11-15 00:26:28Z', 'Nov 14, 2022, 19:26']
    ].forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDateTime(value)).toBe(expected);
        });
    });

    it('invalid date', () => {
        expect(toLocaleDateTime('')).toBe('n/a');
    });
});

describe('local date ISO', () => {
    [
        ['2022-11-15 20:26:28Z', '2022-11-15'],
        ['2022-11-15 08:26:28Z', '2022-11-15'],
        ['2022-11-16 00:26:28Z', '2022-11-15']
    ].forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDateISO(value)).toBe(expected);
        });
    });

    it('invalid date', () => {
        expect(toLocaleDateISO('')).toBe('n/a');
    });
});

describe('local time ISO', () => {
    [
        ['2022-11-15 20:26:28Z', '15:26:28'],
        ['2022-11-15 08:26:28Z', '03:26:28'],
        ['2022-11-16 00:26:28Z', '19:26:28']
    ].forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleTimeISO(value)).toBe(expected);
        });
    });

    it('invalid date', () => {
        expect(toLocaleTimeISO('')).toBe('n/a');
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

describe('utc hour to local hour', () => {
    const entries: Array<[string, string]> = [
        ['09:00', '04:00'],
        ['10:45', '05:45'],
        ['11:59', '06:59'],
        ['17:00', '12:00'],
        ['22:36', '17:36']
    ];

    entries.forEach(([value, expected]) => {
        it(value, () => {
            expect(utcHourToLocaleHour(value)).toBe(expected);
        });
    });
});

describe('utc week day to local week day', () => {
    const entries: Array<[WeekDay, string, string]> = [
        ['Sunday', '00:00', 'Sat'],
        ['Sunday', '22:00', 'Sun'],
        ['Wednesday', '13:00', 'Wed'],
        ['Friday', '23:59', 'Fri'],
        ['Saturday', '10:00', 'Sat']
    ];

    entries.forEach(([weekDay, utcTimeString, expected]) => {
        it(`${weekDay} ${utcTimeString}`, () => {
            expect(utcWeekDayToLocaleWeekDay(weekDay, utcTimeString)).toBe(expected);
        });
    });
});
