import { expect, test } from 'vitest';
import {
    abbreviateNumber,
    formatCurrency,
    formatNumberWithCommas,
    toDecimals
} from '$lib/helpers/numbers';

/*
Abbreviate Number
*/
test('return the same number as a string if it is less than 1000', () => {
    expect(abbreviateNumber(500)).toEqual('500');
});

test('abbreviate thousands correctly', () => {
    expect(abbreviateNumber(1500)).toEqual('1.5K');
    expect(abbreviateNumber(2000)).toEqual('2K');
});

test('abbreviate millions correctly', () => {
    expect(abbreviateNumber(1500000)).toEqual('1.5M');
    expect(abbreviateNumber(2000000)).toEqual('2M');
});

test('handle NaN correctly', () => {
    expect(abbreviateNumber(NaN)).toEqual('NaN');
});

test('handle decimals correctly', () => {
    expect(abbreviateNumber(1500, 2)).toEqual('1.50K');
    expect(abbreviateNumber(1500000, 2)).toEqual('1.50M');
});

/*
To Decimals
*/
test('correctly format numbers with default decimal', () => {
    expect(toDecimals(1.2345)).toEqual(1.2);
});

test('correctly format numbers with specified decimals', () => {
    expect(toDecimals(1.2345, 3)).toEqual(1.234);
});

test('correctly format integers', () => {
    expect(toDecimals(5)).toEqual(5.0);
});

test('correctly handle zero', () => {
    expect(toDecimals(0)).toEqual(0.0);
});

/*
Format Number with Commas
*/
test('format numbers with commas correctly', () => {
    expect(formatNumberWithCommas(1000)).toBe('1,000');
    expect(formatNumberWithCommas(1000000)).toBe('1,000,000');
    expect(formatNumberWithCommas(1234567890)).toBe('1,234,567,890');
});

test('return the input as a string if it is not a number', () => {
    expect(formatNumberWithCommas(NaN)).toEqual('NaN');
});

/*
Format Currency
*/
test('format number to USD by default', () => {
    expect(formatCurrency(1000)).toEqual('$1,000.00');
});

test('format number to specified currency', () => {
    expect(formatCurrency(1000, 'en-US', 'EUR')).toEqual('€1,000.00');
});

//The formatCurrency function is using a non-breaking space before the currency symbol, so regular spaces break the test. Hence the \u00A0. XD
test('format number according to specified locale and currency', () => {
    expect(formatCurrency(1000, 'de-DE', 'EUR')).toEqual('1.000,00\u00A0€');
});

test('return the input as a string if it is not a number', () => {
    expect(formatCurrency(NaN)).toEqual('NaN');
});
