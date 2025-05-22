import { writable } from 'svelte/store';

export const menuOpen = writable(false);

export const activeMenuId = writable<string | null>(null);
