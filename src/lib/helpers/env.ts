/**
 * Parses environment variable parameter string.
 * Supports both KEY and KEY=value formats.
 * @param envParam - Comma-separated string of env vars (e.g., "KEY1,KEY2=value2")
 * @returns Array of objects with key and value properties
 */
export function parseEnvParam(envParam: string | null): Array<{ key: string; value: string }> {
    if (!envParam) return [];
    return envParam.split(',').map((entry: string) => {
        const trimmed = entry.trim();
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) {
            return { key: trimmed, value: '' };
        }
        return {
            key: trimmed.substring(0, eqIndex),
            value: trimmed.substring(eqIndex + 1)
        };
    });
}
