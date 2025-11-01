import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const loading = writable(true);
export const redirectTo = writable<string | null>(null);
export const requestedMigration = writable<Record<string, string> | null>(null);

export const isEmailVerificationRequired = writable<boolean | null>(null);

loading.subscribe((value) => {
    if (browser) globalThis.document.body.dataset.loading = value ? 'true' : 'false';
});
