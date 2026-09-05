import { expect, test } from 'vitest';
import { calculateSize } from '$lib/helpers/sizeConvertion';

/*
calculateSize - normal values
*/
test('formats zero as Bytes', () => {
    expect(calculateSize(0)).toEqual('0 Bytes');
});

test('formats byte values under the base', () => {
    expect(calculateSize(1)).toEqual('1 Bytes');
    expect(calculateSize(999)).toEqual('999 Bytes');
});

test('scales to the correct unit (base 1000)', () => {
    expect(calculateSize(1000)).toEqual('1 KB');
    expect(calculateSize(1500)).toEqual('1.5 KB');
    expect(calculateSize(1_000_000)).toEqual('1 MB');
    expect(calculateSize(123_456_789)).toEqual('123.5 MB');
});

test('scales to the correct unit (base 1024)', () => {
    expect(calculateSize(1024, 1, 1024)).toEqual('1 KB');
    expect(calculateSize(1_073_741_824, 1, 1024)).toEqual('1 GB');
});

test('respects the decimals argument', () => {
    expect(calculateSize(1500, 0)).toEqual('2 KB');
    expect(calculateSize(1536, 2, 1024)).toEqual('1.5 KB');
});

/*
calculateSize - invalid / edge input
Regression: previously these produced strings like "NaN undefined" / "500 undefined"
because Math.log of a non-finite/negative value yields an out-of-range unit index.
*/
test('handles non-finite input without emitting "undefined"', () => {
    expect(calculateSize(NaN)).toEqual('0 Bytes');
    expect(calculateSize(Infinity)).toEqual('0 Bytes');
    expect(calculateSize(-Infinity)).toEqual('0 Bytes');
});

test('handles nullish input coerced to a number', () => {
    // API sizes (e.g. a deployment still building) can be undefined/null at the call site.
    expect(calculateSize(undefined as unknown as number)).toEqual('0 Bytes');
    expect(calculateSize(null as unknown as number)).toEqual('0 Bytes');
});

test('handles negative input', () => {
    expect(calculateSize(-5)).toEqual('0 Bytes');
});

test('handles sub-1-byte input without an undefined unit', () => {
    expect(calculateSize(0.5)).toEqual('0.5 Bytes');
});
