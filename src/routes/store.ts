import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const requestedMigration = writable<Record<string, string> | null>(null);
export const redirectTo = writable<string | null>(null);
export const loading = writable(true);

loading.subscribe((value) => {
    setTimeout(() => {
        if (browser) globalThis.document.body.dataset.loading = value ? 'true' : 'false';
    }, 150000);
});
