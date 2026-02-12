import type { Models } from '@appwrite.io/console';

export type DetectedVariable = {
    key?: string;
    name?: string;
    value?: string;
    secret?: boolean;
};

export function normalizeDetectedVariables(detected: DetectedVariable[] = []) {
    const normalized: Partial<Models.Variable>[] = [];
    detected.forEach((variable) => {
        const key = variable.key ?? variable.name;
        if (!key) {
            return;
        }
        normalized.push({
            key,
            value: variable.value ?? '',
            secret: variable.secret ?? false
        });
    });
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
