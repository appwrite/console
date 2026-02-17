import type { Models } from '@appwrite.io/console';

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
