export type PrefRow = { key: string; value: string };

export function normalizePrefs(entries: [string, string][] | PrefRow[]): [string, string][] {
    return entries
    .map((item): [string, string] =>
        Array.isArray(item)
            ? [item[0], item[1]]
            : [item.key, item.value]
    )
    
        .filter(([k, v]) => k.trim() && v.trim())
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
    return prefs.filter((p) => p.key.trim() && p.value.trim());
}
