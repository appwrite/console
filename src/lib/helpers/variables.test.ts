import { expect, test } from 'vitest';
import {
    getVariableKeyError,
    isValidVariableKey,
    validateVariables,
    VARIABLE_KEY_MAX_LENGTH,
    VARIABLE_VALUE_MAX_LENGTH
} from '$lib/helpers/variables';

test('accept keys that are valid environment variable names', () => {
    expect(isValidVariableKey('APP_TEST')).toBe(true);
    expect(isValidVariableKey('_PRIVATE')).toBe(true);
    expect(isValidVariableKey('key1')).toBe(true);
    expect(isValidVariableKey('a'.repeat(VARIABLE_KEY_MAX_LENGTH))).toBe(true);
});

test('reject keys that cannot be used as environment variable names', () => {
    expect(isValidVariableKey('MY-KEY')).toBe(false);
    expect(isValidVariableKey('MY.KEY')).toBe(false);
    expect(isValidVariableKey('MY KEY')).toBe(false);
    expect(isValidVariableKey('9KEY')).toBe(false);
    expect(isValidVariableKey('KÉY')).toBe(false);
    expect(isValidVariableKey('KEY\t')).toBe(false);
    expect(isValidVariableKey('')).toBe(false);
    expect(isValidVariableKey('a'.repeat(VARIABLE_KEY_MAX_LENGTH + 1))).toBe(false);
});

test('report a missing key separately from an invalid one', () => {
    expect(getVariableKeyError('')).toEqual('Variable key is required');
    expect(getVariableKeyError('MY-KEY')).toContain('is invalid');
    expect(getVariableKeyError('a'.repeat(VARIABLE_KEY_MAX_LENGTH + 1))).toContain('longer than');
    expect(getVariableKeyError('APP_TEST')).toBeNull();
});

test('validate a list of variables and name the offending key', () => {
    expect(validateVariables([{ key: 'APP_TEST', value: 'value' }])).toBeNull();
    expect(validateVariables([{ key: 'APP_TEST', value: '' }])).toBeNull();

    expect(
        validateVariables([
            { key: 'APP_TEST', value: 'value' },
            { key: 'MY-KEY', value: 'value' }
        ])
    ).toContain('MY-KEY');

    expect(
        validateVariables([{ key: 'APP_TEST', value: 'v'.repeat(VARIABLE_VALUE_MAX_LENGTH + 1) }])
    ).toContain('APP_TEST');
});
