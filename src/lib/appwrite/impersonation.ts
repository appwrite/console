import { derived, writable } from 'svelte/store';
import { building } from '$app/environment';

const KEY_TARGET_USER_ID = 'console.impersonation.targetUserId';
const KEY_OPERATOR = 'console.impersonation.operator';
const KEY_TARGET = 'console.impersonation.target';

export type OperatorSnapshot = {
    $id: string;
    name: string;
    email: string;
};

export type TargetSnapshot = {
    $id: string;
    name: string;
    email: string;
};

/**
 * Incrementing revision triggers reactive re-fetches after impersonation changes.
 * Consumers can depend() on this or subscribe to it.
 */
export const impersonationRevision = writable(0);

function bumpRevision() {
    impersonationRevision.update((n) => n + 1);
}

/**
 * All SDK clients that need impersonation headers applied/cleared.
 * Populated lazily by sdk.ts via registerImpersonationClients().
 */
let _clients: import('@appwrite.io/console').Client[] = [];

export function registerImpersonationClients(
    clients: import('@appwrite.io/console').Client[]
): void {
    _clients = clients;
}

export function applyImpersonation(targetUserId: string): void {
    for (const client of _clients) {
        client.setImpersonateUserId(targetUserId);
    }
}

export function clearImpersonation(): void {
    for (const client of _clients) {
        // Use the typed setters to empty the values so the SDK removes the headers cleanly.
        client.setImpersonateUserId('');
        client.setImpersonateUserEmail('');
        client.setImpersonateUserPhone('');
    }
}

export function persistImpersonation(target: TargetSnapshot, operator: OperatorSnapshot): void {
    sessionStorage.setItem(KEY_TARGET_USER_ID, target.$id);
    sessionStorage.setItem(KEY_TARGET, JSON.stringify(target));
    sessionStorage.setItem(KEY_OPERATOR, JSON.stringify(operator));
}

export function clearPersistedImpersonation(): void {
    sessionStorage.removeItem(KEY_TARGET_USER_ID);
    sessionStorage.removeItem(KEY_TARGET);
    sessionStorage.removeItem(KEY_OPERATOR);
}

export function readTargetSnapshot(): TargetSnapshot | null {
    if (building) return null;
    const raw = sessionStorage.getItem(KEY_TARGET);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as TargetSnapshot;
    } catch {
        return null;
    }
}

export function readImpersonationTargetUserId(): string | null {
    if (building) return null;
    return sessionStorage.getItem(KEY_TARGET_USER_ID);
}

export function createImpersonatedResourceUrl(
    url: string,
    queryParams: Record<string, string | number | boolean | undefined> = {}
): string {
    const parsedUrl = new URL(url, globalThis.location?.origin);
    const targetUserId = readImpersonationTargetUserId();

    for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
            parsedUrl.searchParams.set(key, value.toString());
        }
    }

    if (!targetUserId) return parsedUrl.toString();

    parsedUrl.searchParams.set('impersonateUserId', targetUserId);

    return parsedUrl.toString();
}

export const impersonatedResourceUrl = derived(
    impersonationRevision,
    () => createImpersonatedResourceUrl
);

export function readOperatorSnapshot(): OperatorSnapshot | null {
    if (building) return null;
    const raw = sessionStorage.getItem(KEY_OPERATOR);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as OperatorSnapshot;
    } catch {
        return null;
    }
}

/**
 * Call once on app startup (e.g. root layout onMount).
 * Re-applies impersonation headers from sessionStorage to all registered clients.
 */
export function restoreImpersonation(): void {
    const targetUserId = readImpersonationTargetUserId();
    if (targetUserId) {
        applyImpersonation(targetUserId);
        bumpRevision();
    }
}

/**
 * Start impersonating a user. Applies headers, persists to sessionStorage,
 * and bumps the revision store so callers can invalidate/refetch.
 */
export function startImpersonation(target: TargetSnapshot, operator: OperatorSnapshot): void {
    applyImpersonation(target.$id);
    persistImpersonation(target, operator);
    bumpRevision();
}

/**
 * Stop impersonating. Clears headers, removes sessionStorage, bumps revision.
 */
export function stopImpersonation(): void {
    clearImpersonation();
    clearPersistedImpersonation();
    bumpRevision();
}
