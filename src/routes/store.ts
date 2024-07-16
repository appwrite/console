import { writable } from 'svelte/store';

export const requestedMigration = writable<Record<string, string> | null>(null);
export const redirectTo = writable<string | null>(null);
export const loading = writable(true);
