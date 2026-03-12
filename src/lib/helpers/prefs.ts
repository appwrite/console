export type PrefRow = { key: string; value: string };

function stringTrim(s: unknown): string {
    return String(s ?? '').trim();
}

export function normalizePrefs(
    entries: [string, unknown][] | PrefRow[] | { key: unknown; value: unknown }[]
): [string, string][] {
    return entries
        .map((item): [string, string] =>
            Array.isArray(item)
                ? [String(item[0] ?? ''), String(item[1] ?? '')]
                : [String(item.key ?? ''), String(item.value ?? '')]
        )
        .filter(([k, v]) => stringTrim(k).length > 0 && stringTrim(v).length > 0)
        .sort(([a], [b]) => a.localeCompare(b));
}

export function createPrefRow(key = '', value = ''): PrefRow {
    return { key, value };
}

export function isAddDisabled(prefs: PrefRow[] | null): boolean {
    return (
        !!prefs &&
        prefs.length > 0 &&
        !(prefs[prefs.length - 1].key && prefs[prefs.length - 1].value)
    );
}

export function sanitizePrefs(prefs: PrefRow[]) {
    return prefs.filter((p) => stringTrim(p.key).length > 0 && stringTrim(p.value).length > 0);
}
