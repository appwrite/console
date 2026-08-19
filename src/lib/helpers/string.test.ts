import {
    singular,
    camelize,
    capitalize,
    normalizeSmartQuotes,
    repairSmartQuotedJson
} from '$lib/helpers/string';
import { expect, test } from 'vitest';

/*
CAMELIZE
*/

test('camelize should convert hyphenated strings to camel case', () => {
    const hyphenated = 'this-is-a-test';
    const expected = 'thisIsATest';
    expect(camelize(hyphenated)).toBe(expected);
});

test('camelize should convert underscored strings to camel case', () => {
    const underscored = 'this_is_a_test';
    const expected = 'thisIsATest';
    expect(camelize(underscored)).toBe(expected);
});

test('camelize should convert spaced strings to camel case', () => {
    const spaced = 'this is a test';
    const expected = 'thisIsATest';
    expect(camelize(spaced)).toBe(expected);
});

test('camelize should return empty string for falsy input', () => {
    expect(camelize(null)).toBe('');
    expect(camelize(undefined)).toBe('');
    expect(camelize('')).toBe('');
});

test('camelize should handle edge cases', () => {
    const edgeCases = [
        { input: 'foo', expected: 'foo' },
        { input: 'foo-bar-', expected: 'fooBar' },
        { input: '-foo-bar', expected: 'fooBar' },
        { input: '--foo-bar--', expected: 'fooBar' },
        { input: '__foo__bar__', expected: 'fooBar' },
        { input: 'foo bar', expected: 'fooBar' },
        { input: 'foo\nbar', expected: 'fooBar' }
    ];
    edgeCases.forEach(({ input, expected }) => {
        expect(camelize(input)).toBe(expected);
    });
});

/*
SINGULAR
*/

test('singular should remove the "s" from strings', () => {
    const pluralNouns = ['apples', 'bananas', 'cherries', 'elephants', 'horses', 'zebras'];
    const singularNouns = ['apple', 'banana', 'cherrie', 'elephant', 'horse', 'zebra'];
    pluralNouns.forEach((noun, index) => {
        expect(singular(noun)).toBe(singularNouns[index]);
    });
});

test('singular should not remove characters from strings that do not contain "s"', () => {
    const singularNouns = ['apple', 'banana', 'cherry'];
    singularNouns.forEach((noun) => {
        expect(singular(noun)).toBe(noun);
    });
});

test('singular should handle edge cases', () => {
    const edgeCases = [
        { input: '', expected: '' },
        { input: 's', expected: '' },
        { input: 'ss', expected: 's' }
    ];
    edgeCases.forEach(({ input, expected }) => {
        expect(singular(input)).toBe(expected);
    });
});

/*
CAPITALIZE
*/

test('capitalize should capitalize the first letter of a string', () => {
    const strings = ['hello world', 'this is a test', 'another example', '1234 testing'];
    const expected = ['Hello world', 'This is a test', 'Another example', '1234 testing'];
    strings.forEach((str, index) => {
        expect(capitalize(str)).toBe(expected[index]);
    });
});

test('capitalize should handle empty strings', () => {
    expect(capitalize('')).toBe('');
});

test('capitalize should handle strings with no lowercase letters', () => {
    expect(capitalize('HELLO')).toBe('HELLO');
});

test('capitalize should handle strings with only one character', () => {
    expect(capitalize('a')).toBe('A');
});

/*
NORMALIZE SMART QUOTES
*/

test('normalizeSmartQuotes replaces curly double quotes only', () => {
    const curly = '{ \u201Ctest\u201D: \u2018value\u2019 }';
    expect(normalizeSmartQuotes(curly)).toBe('{ "test": \u2018value\u2019 }');
});

test('normalizeSmartQuotes leaves ASCII quotes unchanged', () => {
    expect(normalizeSmartQuotes('{ "test": \'value\' }')).toBe('{ "test": \'value\' }');
});

test('normalizeSmartQuotes handles empty input', () => {
    expect(normalizeSmartQuotes('')).toBe('');
});

test('repairSmartQuotedJson fixes curly structural quotes', () => {
    const curly = '{ \u201Ctest\u201D: \u201Cvalue\u201D }';
    expect(repairSmartQuotedJson(curly)).toBe('{ "test": "value" }');
});

test('repairSmartQuotedJson leaves valid JSON with curly quotes in values', () => {
    const valid = '{ "quote": "He said \u201Chello\u201D" }';
    expect(repairSmartQuotedJson(valid)).toBe(valid);
});

test('repairSmartQuotedJson preserves apostrophes when repairing delimiters', () => {
    const curly = '{ \u201Cname\u201D: \u201CO\u2019Brien\u201D }';
    expect(repairSmartQuotedJson(curly)).toBe('{ "name": "O\u2019Brien" }');
});

test('repairSmartQuotedJson leaves non-JSON bodies unchanged', () => {
    const plain = 'Hello \u201Cworld\u201D';
    expect(repairSmartQuotedJson(plain)).toBe(plain);
});
