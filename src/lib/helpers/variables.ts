import type { Models } from '@appwrite.io/console';

export const VARIABLE_KEY_MAX_LENGTH = 255;
export const VARIABLE_VALUE_MAX_LENGTH = 8192;

/**
 * Variable keys become environment variable names at build and runtime, so the
 * API only accepts C-style identifiers. Keys stored before that rule existed
 * can still fail this check, which is why `isValidVariableKey` is also used to
 * flag them in the variables table.
 */
const VARIABLE_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function isValidVariableKey(key: string): boolean {
    return (
        typeof key === 'string' &&
        key.length <= VARIABLE_KEY_MAX_LENGTH &&
        VARIABLE_KEY_PATTERN.test(key)
    );
}

export function getVariableKeyError(key: string): string | null {
    if (!key) {
        return 'Variable key is required';
    }

    if (key.length > VARIABLE_KEY_MAX_LENGTH) {
        return `Variable key "${key}" is longer than ${VARIABLE_KEY_MAX_LENGTH} allowed characters`;
    }

    if (!VARIABLE_KEY_PATTERN.test(key)) {
        return `Variable key "${key}" is invalid. Keys can only contain letters, digits and underscores, and cannot start with a digit`;
    }

    return null;
}

export function getVariableValueError(key: string, value: unknown): string | null {
    if (('' + (value ?? '')).length > VARIABLE_VALUE_MAX_LENGTH) {
        return `Variable ${key} is longer than ${VARIABLE_VALUE_MAX_LENGTH} allowed characters`;
    }

    return null;
}

/**
 * Returns the first problem found, or null when every variable is accepted by
 * the API. Call before submitting so a rejected key is reported against the
 * file or row it came from instead of as a bare server error.
 */
export function validateVariables(
    variables: Array<{ key?: string; value?: unknown }>
): string | null {
    for (const { key, value } of variables) {
        const keyError = getVariableKeyError(key);
        if (keyError) {
            return keyError;
        }

        const valueError = getVariableValueError(key, value);
        if (valueError) {
            return valueError;
        }
    }

    return null;
}

export function normalizeDetectedVariables(
    detected: Models.DetectionVariable[] = []
): Partial<Models.Variable>[] {
    const normalized: Partial<Models.Variable>[] = [];
    for (const variable of detected) {
        const key = variable.name?.trim();
        if (!key) {
            continue;
        }
        normalized.push({
            key,
            value: variable.value ?? '',
            secret: false
        });
    }
    return normalized;
}

export function mergeVariables(
    existing: Partial<Models.Variable>[],
    detected: Partial<Models.Variable>[]
) {
    const map = new Map(existing.map((variable) => [variable.key, variable]));
    detected.forEach((variable) => {
        if (!variable.key) {
            return;
        }
        if (!map.has(variable.key)) {
            map.set(variable.key, variable);
        }
    });
    return Array.from(map.values());
}
