import { singular, camelize, capitalize } from '$lib/helpers/string';
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
