export type PrefRow = { key: string; value: string };

function stringTrim(s: unknown): string {
    return String(s ?? '').trim();
}

export function stringifyPrefValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

export function normalizePrefs(
    entries: [string, unknown][] | PrefRow[] | { key: unknown; value: unknown }[]
): [string, string][] {
    return entries
        .map((item): [string, string] =>
            Array.isArray(item)
                ? [String(item[0] ?? ''), stringifyPrefValue(item[1])]
                : [String(item.key ?? ''), stringifyPrefValue(item.value)]
        )
        .filter(([k, v]) => stringTrim(k).length > 0 && stringTrim(v).length > 0)
        .sort(([a], [b]) => a.localeCompare(b));
}

export function createPrefRow(key = '', value = ''): PrefRow {
    return { key, value };
}

export function createPrefRows(prefs: Record<string, unknown> | null | undefined): PrefRow[] {
    const entries = Object.entries(prefs ?? {});

    return entries.length > 0
        ? entries.map(([key, value]) => createPrefRow(String(key ?? ''), stringifyPrefValue(value)))
        : [createPrefRow()];
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

export function parsePrefValue(value: string, original: unknown): unknown {
    const trimmed = value.trim();

    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;

    try {
        return JSON.parse(value);
    } catch {
        if (typeof original !== 'string' && original !== undefined) return original;
        return value;
    }
}
