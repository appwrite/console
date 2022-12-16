import '@testing-library/jest-dom';
import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';

describe('local date', () => {
    const dates = [
        ['2022-11-15 08:26:28', 'Nov 15, 2022'],
        ['2022-11-15 00:26:28', 'Nov 15, 2022']
    ] as const;

    dates.forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDate(value)).toBe(expected);
        });
    });
});

describe('local date time', () => {
    const dates = [
        ['2022-11-15 08:26:28', 'Nov 15, 2022, 08:26'],
        ['2022-11-15 00:26:28', 'Nov 15, 2022, 00:26']
    ] as const;

    dates.forEach(([value, expected]) => {
        it(value, () => {
            expect(toLocaleDateTime(value)).toBe(expected);
        });
    });
});
