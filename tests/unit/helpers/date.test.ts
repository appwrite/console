import '@testing-library/jest-dom';
import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';

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
