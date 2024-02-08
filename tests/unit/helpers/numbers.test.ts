import '@testing-library/jest-dom';
import {
    abbreviateNumber,
    formatCurrency,
    formatNumberWithCommas,
    toDecimals
} from '$lib/helpers/numbers';

/*
Abbreviate Number
*/
test('should return the same number as a string if it is less than 1000', () => {
    expect(abbreviateNumber(500)).toEqual('500');
});

test('should abbreviate thousands correctly', () => {
    expect(abbreviateNumber(1500)).toEqual('1.5K');
    expect(abbreviateNumber(2000)).toEqual('2K');
});

test('should abbreviate millions correctly', () => {
    expect(abbreviateNumber(1500000)).toEqual('1.5M');
    expect(abbreviateNumber(2000000)).toEqual('2M');
});

test('should handle NaN correctly', () => {
    expect(abbreviateNumber(NaN)).toEqual('NaN');
});

test('should handle decimals correctly', () => {
    expect(abbreviateNumber(1500, 2)).toEqual('1.50K');
    expect(abbreviateNumber(1500000, 2)).toEqual('1.50M');
});

/*
To Decimals
*/
test('should correctly format numbers with default decimal', () => {
    expect(toDecimals(1.2345)).toEqual(1.2);
});

test('should correctly format numbers with specified decimals', () => {
    expect(toDecimals(1.2345, 3)).toEqual(1.234);
});

test('should correctly format integers', () => {
    expect(toDecimals(5)).toEqual(5.0);
});

test('should correctly handle zero', () => {
    expect(toDecimals(0)).toEqual(0.0);
});

/*
Format Number with Commas
*/
test('should format numbers with commas correctly', () => {
    expect(formatNumberWithCommas(1000)).toBe('1,000');
    expect(formatNumberWithCommas(1000000)).toBe('1,000,000');
    expect(formatNumberWithCommas(1234567890)).toBe('1,234,567,890');
});

test('should return the input as a string if it is not a number', () => {
    expect(formatNumberWithCommas(NaN)).toEqual('NaN');
});

/*
Format Currency
*/
test('should format number to USD by default', () => {
    expect(formatCurrency(1000)).toEqual('$1,000.00');
});

test('should format number to specified currency', () => {
    expect(formatCurrency(1000, 'en-US', 'EUR')).toEqual('€1,000.00');
});

//The formatCurrency function is using a non-breaking space before the currency symbol, so regular spaces break the test. Hence the \u00A0. XD
test('should format number according to specified locale and currency', () => {
    expect(formatCurrency(1000, 'de-DE', 'EUR')).toEqual('1.000,00\u00A0€');
});

test('should return the input as a string if it is not a number', () => {
    expect(formatCurrency(NaN)).toEqual('NaN');
});
